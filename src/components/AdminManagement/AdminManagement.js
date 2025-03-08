import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Container, Row, Col, Card, InputGroup, FormControl, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaSync, FaUser, FaFileExport, FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { machineService, workerService } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './AdminManagement.css';

const AdminManagement = () => {
  // State for machines and workers
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modals
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State for selected items
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // State for form data
  const [machineFormData, setMachineFormData] = useState({ name: '', type: '', status: 'operational', assignedWorker: '' });
  const [workerFormData, setWorkerFormData] = useState({ name: '', specialty: '', assignedMachines: [] });

  // State for sorting and filtering
  const [workerSort, setWorkerSort] = useState({ field: '_id', direction: 'asc' });
  const [workerFilter, setWorkerFilter] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());

  // Add state for delete confirmation modal
  const [showDeleteWorkerModal, setShowDeleteWorkerModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  // Fetch machines and workers on component mount
  useEffect(() => {
    fetchMachines();
    fetchWorkers();
    
    // Update timestamp every minute
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch machines from API
  const fetchMachines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineService.getAllMachines();
      setMachines(data);
    } catch (err) {
      setError('Failed to fetch machines. Please try again later.');
      console.error('Error fetching machines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch workers from API
  const fetchWorkers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workerService.getAllWorkers();
      setWorkers(data);
    } catch (err) {
      setError('Failed to fetch workers. Please try again later.');
      console.error('Error fetching workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to French locale
  const formattedTimestamp = timestamp.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Machine status badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return <Badge bg="success">🟢 Opérationnel</Badge>;
      case 'maintenance':
        return <Badge bg="warning" text="dark">🟡 En maintenance</Badge>;
      case 'offline':
        return <Badge bg="danger">🔴 Hors service</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  // Handle machine form submission
  const handleMachineSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedMachine) {
        // Update existing machine
        await machineService.updateMachine(selectedMachine._id, machineFormData);
      } else {
        // Add new machine
        await machineService.createMachine(machineFormData);
      }
      
      // Refresh machines list
      await fetchMachines();
      
      // Close modal and reset form
      setShowMachineModal(false);
      setSelectedMachine(null);
      setMachineFormData({ name: '', type: '', status: 'operational', assignedWorker: '' });
    } catch (err) {
      setError('Failed to save machine. Please try again.');
      console.error('Error saving machine:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle worker form submission
  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedWorker) {
        // Update existing worker
        await workerService.updateWorker(selectedWorker._id, workerFormData);
      } else {
        // Add new worker
        await workerService.createWorker(workerFormData);
      }
      
      // Refresh workers list
      await fetchWorkers();
      
      // Close modal and reset form
      setShowWorkerModal(false);
      setSelectedWorker(null);
      setWorkerFormData({ name: '', specialty: '', assignedMachines: [] });
    } catch (err) {
      setError('Failed to save worker. Please try again.');
      console.error('Error saving worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle machine deletion
  const handleDeleteMachine = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await machineService.deleteMachine(id);
      await fetchMachines();
    } catch (err) {
      setError('Failed to delete machine. Please try again.');
      console.error('Error deleting machine:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle worker deletion
  const handleDeleteWorker = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await workerService.deleteWorker(id);
      await fetchWorkers();
      setShowDeleteWorkerModal(false);
      setWorkerToDelete(null);
    } catch (err) {
      setError('Failed to delete worker. Please try again.');
      console.error('Error deleting worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle machine edit
  const handleEditMachine = (machine) => {
    setSelectedMachine(machine);
    setMachineFormData({ 
      name: machine.name, 
      type: machine.type, 
      status: machine.status, 
      assignedWorker: machine.assignedWorker 
    });
    setShowMachineModal(true);
  };

  // Handle worker edit
  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setWorkerFormData({ 
      name: worker.name, 
      specialty: worker.specialty, 
      assignedMachines: worker.assignedMachines || [] 
    });
    setShowWorkerModal(true);
  };

  // Handle worker reassignment
  const handleReassignWorker = (worker) => {
    setSelectedWorker(worker);
    setShowReassignModal(true);
  };

  // Handle worker profile view
  const handleViewProfile = (worker) => {
    setSelectedWorker(worker);
    setShowProfileModal(true);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    console.log('Exporting workers to CSV...');
    setShowExportModal(false);
  };

  // Sort workers
  const sortedWorkers = [...workers].sort((a, b) => {
    const aValue = a[workerSort.field];
    const bValue = b[workerSort.field];
    
    if (workerSort.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter workers
  const filteredWorkers = sortedWorkers.filter(worker => 
    worker.name.toLowerCase().includes(workerFilter.toLowerCase()) ||
    worker.specialty.toLowerCase().includes(workerFilter.toLowerCase())
  );

  // Toggle sort direction
  const toggleSort = (field) => {
    if (workerSort.field === field) {
      setWorkerSort({
        field,
        direction: workerSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setWorkerSort({
        field,
        direction: 'asc'
      });
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (workerSort.field !== field) {
      return <FaSort className="sort-icon" />;
    }
    return workerSort.direction === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  // Add a function to open the delete confirmation modal
  const confirmDeleteWorker = (worker) => {
    setWorkerToDelete(worker);
    setShowDeleteWorkerModal(true);
  };

  // Handle saving reassigned worker
  const handleSaveReassignment = async () => {
    if (!selectedWorker) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await workerService.updateWorker(selectedWorker._id, selectedWorker);
      await fetchWorkers();
      setShowReassignModal(false);
    } catch (err) {
      setError('Failed to reassign worker. Please try again.');
      console.error('Error reassigning worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-management-container">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1 className="page-title">Gestion Admin</h1>
            <div className="timestamp">Dernière mise à jour: {formattedTimestamp}</div>
          </Col>
        </Row>

        {/* Display error message if there is one */}
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <Tabs defaultActiveKey="machines" id="admin-tabs" className="mb-4">
          <Tab eventKey="machines" title="Machines">
            <Card className="section-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h2>Machines</h2>
                <Button variant="success" className="add-btn" onClick={() => {
                  setSelectedMachine(null);
                  setMachineFormData({ name: '', type: '', status: 'operational', assignedWorker: '' });
                  setShowMachineModal(true);
                }}>
                  <FaPlus /> Ajouter une Machine
                </Button>
              </Card.Header>
              <Card.Body>
                {isLoading && <LoadingSpinner text="Chargement des machines..." />}
                <div className="table-responsive">
                  {!isLoading && machines.length > 0 ? (
                    <Table striped hover className="machines-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Statut</th>
                          <th>Ouvrier Assigné</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machines.map(machine => (
                          <tr key={machine._id}>
                            <td>{machine._id.substring(0, 8)}</td>
                            <td>{machine.name}</td>
                            <td>{machine.type}</td>
                            <td>{renderStatusBadge(machine.status)}</td>
                            <td>{machine.assignedWorker}</td>
                            <td className="actions-cell">
                              <Button variant="outline-primary" size="sm" className="action-btn" onClick={() => handleEditMachine(machine)}>
                                <FaEdit /> 
                              </Button>
                              <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => handleDeleteMachine(machine._id)}>
                                <FaTrashAlt />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : !isLoading && (
                    <div className="empty-state">
                      <p>Aucune machine n'a été ajoutée. Cliquez sur "Ajouter une Machine" pour commencer.</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="workers" title="Ouvriers">
            <Card className="section-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h2>Ouvriers</h2>
                <div className="header-actions">
                  <Button variant="outline-secondary" className="export-btn me-2" onClick={() => setShowExportModal(true)}>
                    <FaFileExport /> Exporter en CSV
                  </Button>
                  <Button variant="primary" className="add-btn" onClick={() => {
                    setSelectedWorker(null);
                    setWorkerFormData({ name: '', specialty: '', assignedMachines: [] });
                    setShowWorkerModal(true);
                  }}>
                    <FaPlus /> Ajouter un Ouvrier
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text><FaSearch /></InputGroup.Text>
                      <FormControl
                        placeholder="Rechercher par nom ou spécialité..."
                        value={workerFilter}
                        onChange={(e) => setWorkerFilter(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                </Row>
                {isLoading && <LoadingSpinner text="Chargement des ouvriers..." />}
                <div className="table-responsive">
                  {!isLoading && filteredWorkers.length > 0 ? (
                    <Table striped hover className="workers-table">
                      <thead>
                        <tr>
                          <th onClick={() => toggleSort('_id')} className="sortable-header">
                            ID {renderSortIcon('_id')}
                          </th>
                          <th onClick={() => toggleSort('name')} className="sortable-header">
                            Nom {renderSortIcon('name')}
                          </th>
                          <th onClick={() => toggleSort('specialty')} className="sortable-header">
                            Spécialité {renderSortIcon('specialty')}
                          </th>
                          <th>Machines Assignées</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWorkers.map(worker => (
                          <tr key={worker._id}>
                            <td>{worker._id.substring(0, 8)}</td>
                            <td>{worker.name}</td>
                            <td>{worker.specialty}</td>
                            <td>
                              {worker.assignedMachines && worker.assignedMachines.length > 0 ? (
                                worker.assignedMachines.join(', ')
                              ) : (
                                <span className="text-muted">Aucune machine assignée</span>
                              )}
                            </td>
                            <td className="actions-cell">
                              <Button variant="outline-primary" size="sm" className="action-btn" onClick={() => handleEditWorker(worker)}>
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => confirmDeleteWorker(worker)}>
                                <FaTrashAlt />
                              </Button>
                              <Button variant="outline-secondary" size="sm" className="action-btn" onClick={() => handleReassignWorker(worker)}>
                                <FaSync />
                              </Button>
                              <Button variant="outline-info" size="sm" className="action-btn" onClick={() => handleViewProfile(worker)}>
                                <FaUser />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : !isLoading && (
                    <div className="empty-state">
                      <p>Aucun ouvrier trouvé avec les critères de recherche actuels.</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* Machine Modal */}
      <Modal show={showMachineModal} onHide={() => setShowMachineModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMachine ? 'Modifier la Machine' : 'Ajouter une Machine'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          <Form onSubmit={handleMachineSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={machineFormData.name}
                    onChange={(e) => setMachineFormData({ ...machineFormData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={machineFormData.type}
                    onChange={(e) => setMachineFormData({ ...machineFormData, type: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={machineFormData.status}
                    onChange={(e) => setMachineFormData({ ...machineFormData, status: e.target.value })}
                    required
                  >
                    <option value="operational">🟢 Opérationnel</option>
                    <option value="maintenance">🟡 En maintenance</option>
                    <option value="offline">🔴 Hors service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ouvrier Assigné</Form.Label>
                  <Form.Select
                    value={machineFormData.assignedWorker}
                    onChange={(e) => setMachineFormData({ ...machineFormData, assignedWorker: e.target.value })}
                  >
                    <option value="">-- Aucun ouvrier assigné --</option>
                    {workers.map(worker => (
                      <option key={worker._id} value={worker.name}>{worker.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowMachineModal(false)} className="me-2">
                Annuler
              </Button>
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : selectedMachine ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Worker Modal */}
      <Modal show={showWorkerModal} onHide={() => setShowWorkerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedWorker ? 'Modifier l\'Ouvrier' : 'Ajouter un Ouvrier'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          <Form onSubmit={handleWorkerSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Spécialité</Form.Label>
                  <Form.Control
                    type="text"
                    value={workerFormData.specialty}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, specialty: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Machines Assignées</Form.Label>
              <div className="machine-checkboxes">
                {machines.map(machine => (
                  <Form.Check
                    key={machine._id}
                    type="checkbox"
                    id={`machine-${machine._id}`}
                    label={machine.name}
                    checked={workerFormData.assignedMachines?.includes(machine.name) || false}
                    onChange={(e) => {
                      const updatedMachines = e.target.checked
                        ? [...(workerFormData.assignedMachines || []), machine.name]
                        : (workerFormData.assignedMachines || []).filter(m => m !== machine.name);
                      setWorkerFormData({ ...workerFormData, assignedMachines: updatedMachines });
                    }}
                  />
                ))}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowWorkerModal(false)} className="me-2">
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : selectedWorker ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Exporter les Données</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Format</Form.Label>
              <Form.Select defaultValue="csv">
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Colonnes à inclure</Form.Label>
              <div>
                <Form.Check type="checkbox" id="col-id" label="ID" defaultChecked />
                <Form.Check type="checkbox" id="col-name" label="Nom" defaultChecked />
                <Form.Check type="checkbox" id="col-specialty" label="Spécialité" defaultChecked />
                <Form.Check type="checkbox" id="col-machines" label="Machines Assignées" defaultChecked />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleExportCSV}>
            Exporter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reassign Modal */}
      <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Réassigner {selectedWorker?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Machines Disponibles</Form.Label>
              <div className="machine-checkboxes">
                {machines.map(machine => (
                  <Form.Check
                    key={machine._id}
                    type="checkbox"
                    id={`reassign-machine-${machine._id}`}
                    label={machine.name}
                    checked={selectedWorker?.assignedMachines?.includes(machine.name) || false}
                    onChange={(e) => {
                      if (!selectedWorker) return;
                      
                      const updatedWorker = { ...selectedWorker };
                      if (e.target.checked) {
                        updatedWorker.assignedMachines = [...(updatedWorker.assignedMachines || []), machine.name];
                      } else {
                        updatedWorker.assignedMachines = (updatedWorker.assignedMachines || []).filter(m => m !== machine.name);
                      }
                      setSelectedWorker(updatedWorker);
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveReassignment} disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Profil de l'Ouvrier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWorker && (
            <div className="worker-profile">
              <div className="profile-header">
                <div className="profile-avatar">
                  <FaUser size={48} />
                </div>
                <div className="profile-info">
                  <h3>{selectedWorker.name}</h3>
                  <p className="text-muted">{selectedWorker.specialty}</p>
                </div>
              </div>
              <hr />
              <h5>Machines Assignées</h5>
              {selectedWorker.assignedMachines && selectedWorker.assignedMachines.length > 0 ? (
                <ul className="assigned-machines-list">
                  {selectedWorker.assignedMachines.map((machine, index) => (
                    <li key={index}>{machine}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Aucune machine assignée</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => {
            setShowProfileModal(false);
            handleEditWorker(selectedWorker);
          }}>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Worker Confirmation Modal */}
      <Modal show={showDeleteWorkerModal} onHide={() => setShowDeleteWorkerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {workerToDelete && (
            <p>
              Êtes-vous sûr de vouloir supprimer l'ouvrier <strong>{workerToDelete.name}</strong> ?
              Cette action est irréversible.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteWorkerModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={() => workerToDelete && handleDeleteWorker(workerToDelete._id)}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminManagement; 