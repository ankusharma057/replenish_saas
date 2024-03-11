import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";

const ImageUploadModal = ({
  isEditModal = false,
  showModal = false,
  afterImages = [],
  beforeImages = [],
  setShowModal = () => {},
  setBeforeImages = () => {},
  setAfterImages = () => {},
  setBlobForAfter = () => {},
  setBlobForBefore = () => {},
  setDeletedBeforeImages = () => {},
  setDeletedAfterImages = () => {},
  handleSave = () => {},
  showButton = true,
}) => {
  const getBase64 = async (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handleFileChange = (event, index, type) => {
    const file = event.target.files[0];
    // Check if the selected file is an image (you can add more image formats if needed)
    if (file && file.type.startsWith("image/")) {
      if (type === "before") {
        setBeforeImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = file;
          return updatedImages;
        });
        setBlobForBefore((prevState) => {
          const updatedBlobs = [...prevState];
          getBase64(file, (url) => {
            updatedBlobs.push(url);
          });
          return updatedBlobs;
        });
      } else if (type === "after") {
        setAfterImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = file;
          return updatedImages;
        });
        setBlobForAfter((prevState) => {
          const updatedBlobs = [...prevState];
          getBase64(file, (url) => {
            updatedBlobs.push(url);
          });
          return updatedBlobs;
        });
      }
    } else {
      alert("Please select an image file.");
    }
  };

  const handleRemoveImage = (index, type) => {
    if (type === "before") {
      const deletedImg = beforeImages[index];
      if (typeof deletedImg === "object") {
        setDeletedBeforeImages((prevState) => {
          const updatedBlobs = [...prevState];
          getBase64(deletedImg, (url) => {
            updatedBlobs.push(url);
          });
          return updatedBlobs;
        });
      } else {
        setDeletedBeforeImages((prevImages) => {
          return [...prevImages, deletedImg];
        });
      }
      const updatedArray = beforeImages;
      updatedArray.splice(index, 1);
      setBeforeImages(updatedArray);
    } else if (type === "after") {
      const deletedImg = afterImages[index];
      if (typeof deletedImg === "object") {
        setDeletedAfterImages((prevState) => {
          const updatedBlobs = [...prevState];
          getBase64(deletedImg, (url) => {
            updatedBlobs.push(url);
          });
          return updatedBlobs;
        });
      } else {
        setDeletedAfterImages((prevImages) => {
          return [...prevImages, deletedImg];
        });
      }
      const updatedArray = afterImages;
      updatedArray.splice(index, 1);
      setAfterImages(updatedArray);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleAddImage = (currentImages, addImagesInto) => {
    if (currentImages.length < 4) addImagesInto([...currentImages, null]);
  };

  const renderImageFields = (images, addMoreImages, type) => {
    return (
      <>
        {images.length < 4 && (
          <div div xs={6} md={3} className="mb-3">
            <Button
              variant="primary"
              onClick={() => handleAddImage(images, addMoreImages)}
            >
              Add Images
            </Button>
          </div>
        )}
        {images.map((image, index) => (
          <Col key={index} xs={6} md={3} className="mb-3">
            <label htmlFor={`${type}ImageInput${index}`}>
              <Button
                variant="primary"
                className="w-100 mb-2"
                onClick={() =>
                  document.getElementById(`${type}ImageInput${index}`).click()
                }
              >
                Upload Image {index + 1}
              </Button>
            </label>
            <input
              id={`${type}ImageInput${index}`}
              type="file"
              style={{ display: "none" }}
              accept="image/*" // Allow only image files
              onChange={(event) => handleFileChange(event, index, type)}
            />
            {image && (
              <div>
                {typeof image === "object" ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${type} image ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      marginTop: "5px",
                    }}
                  />
                ) : (
                  <img
                    src={image}
                    alt={`Uploaded ${type} image ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      marginTop: "5px",
                    }}
                  />
                )}
                <Button
                  variant="danger"
                  size="sm"
                  className="w-100 mt-2"
                  onClick={() => handleRemoveImage(index, type)}
                >
                  Remove
                </Button>
              </div>
            )}
          </Col>
        ))}
      </>
    );
  };

  return (
    <>
      {showButton && (
        <Button
          style={{ height: "50px" }}
          variant="primary"
          onClick={handleShowModal}
        >
          Upload Images
        </Button>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Image Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Before Images</h4>
          <Row>
            {renderImageFields(beforeImages, setBeforeImages, "before")}
          </Row>
          <h4 className="mt-4">After Images</h4>
          <Row>{renderImageFields(afterImages, setAfterImages, "after")}</Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={isEditModal ? handleSave : handleCloseModal}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageUploadModal;
