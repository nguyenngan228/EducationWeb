
import { CheckCircle, XCircle } from 'lucide-react';
import './modal.css'
import { Button, Modal } from 'react-bootstrap';

export const Noti=({ show, onHide, title, message, isError })=>{
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center">
        <div className="mb-3">
          {isError ? (
            <XCircle size={50} color="red" />
          ) : (
            <CheckCircle size={50} color="green" />
          )}
        </div>
        <h4 style={{ color: isError ? 'red' : 'green' }}>{title}</h4>
        <p>{message}</p>
        <Button variant={isError ? 'danger' : 'success'} onClick={onHide}>
          Ok
        </Button>
      </Modal.Body>
    </Modal>
  );
}

