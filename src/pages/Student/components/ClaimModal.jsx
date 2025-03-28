import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BsQuestionCircle } from 'react-icons/bs'; // Help icon
import axios from 'axios';
import { useAuth } from '../../../../AuthContext';

const ClaimModal = ({ show, handleClose, existingItem, fetchItems }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sender_id: user?.id,
        receiver_id: existingItem?.user_id,
        report_id: existingItem?.id,
        message: '',
        type: '',
        image: null,
    });

    useEffect(() => {
        if (show) {
            if (existingItem) {
                setFormData({
                    sender_id: user?.id,
                    receiver_id: existingItem?.user_id,
                    report_id: existingItem?.id,
                    message: '',
                    type: '',
                    image: null,
                });
            } else {
                resetForm();
            }
        }
    }, [show, existingItem]);

    // Tooltip for the help icon
    const renderTooltip = (props) => (
        <Tooltip id="help-tooltip" {...props} className="bg-white">
            To claim this item, please provide your contact information and a detailed description of the item to prove ownership.
            If possible, upload an image of the item or proof of ownership.
        </Tooltip>
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { message, image } = formData;

        if (!message.trim() && !image) return;

        const messageData = new FormData();
        messageData.append("sender_id", user.id);
        messageData.append("receiver_id", existingItem?.user_id);
        messageData.append("report_id", existingItem?.id);
        messageData.append("message", message.trim());
        messageData.append('item_type', existingItem?.type);
        if (image) {
            messageData.append("image", image);
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/messages/send-message', messageData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success) {
                resetForm();
                fetchItems();
                handleClose();
            } else {
                console.error('Error sending message:', response.data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const resetForm = () => {
        setFormData({
            sender_id: user?.id,
            receiver_id: existingItem?.user_id,
            report_id: existingItem?.id,
            message: '',
            type: '',
            image: null,
        });
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Claim Found Item</Modal.Title>
                <OverlayTrigger placement="left" overlay={renderTooltip}>
                    <BsQuestionCircle className="ms-2 text-primary" size={20} style={{ cursor: 'pointer' }} />
                </OverlayTrigger>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Item Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="item_name"
                            value={existingItem ? existingItem.item_name : ''}
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Message <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={3}
                            required
                            placeholder="Describe the item in detail to prove ownership"
                        />
                        <Form.Text className="text-muted">
                            Include specific details about the item that only the owner would know
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Claim Item'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ClaimModal;
