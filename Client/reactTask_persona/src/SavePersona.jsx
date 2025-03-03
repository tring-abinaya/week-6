import './SavePersona.css'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import image1 from './assets/image.png';
import { gql, useLazyQuery, useMutation } from '@apollo/client';


const ADD_PERSONA = gql`
  mutation addPersona($createPersonaInput:CreatePersonaInput!){
    addPersona(createPersonaInput:$createPersonaInput)
  }
`;

const GET_PERSONA_BY_ID = gql`
  query getPersonaById($personaId: Int!){
  getPersonaById(personaId: $personaId) {
    image
    name
    quote
    description
    motivations
    pain_points
    jobs_needs
    activities
    user_id
  }
}
`;

const UPDATE_PERSONA = gql`
    mutation updatePersona($updatePersonaInput:UpdatePersonaInput!){
        updatePersona(updatePersonaInput:$updatePersonaInput)
    }
`;

const DELETE_PERSONA=gql`
    mutation deletePersona($persona_id:Int!){
        deletePersona(personaId:$persona_id)
    }
`;

function SavePersona() {

    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [image, setImage] = useState(null);
    const handleShow = () => setShow(true);
    const [cardInfo, setCardInfo] = useState({
        name: "",
        quote: "",
        description: "",
        motivations: "",
        painPoints: "",
        jobNeeds: "",
        activities: "",
        image: image1
    });
    const {id} = useParams();


    const [addPersona] = useMutation(ADD_PERSONA, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            console.log(data)
            navigate(-1)
        },
        onError: (err) => {
            console.log(err)
        }
    })

    const [getPersonaById] = useLazyQuery(GET_PERSONA_BY_ID, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            console.log(data)
            setCardInfo(data.getPersonaById)
        },
        onError: (err) => {
            console.log(err)
        }
    })

    const [updatePersona] = useMutation(UPDATE_PERSONA, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            console.log(data)
            navigate(-1)
        },
        onError: (err) => {
            console.log(err)
        }
    })

    const [deletePersona]=useMutation(DELETE_PERSONA,{
        fetchPolicy:"no-cache",
        onCompleted:(data)=>{
            console.log(data)
            navigate(-1)
        },
        onError:(err)=>{
            console.log(err)
        }
    })

    useEffect(() => {
        if (id) {

            getPersonaById({
                variables: {
                    personaId: parseInt(id)
                }
            })
            console.log("Persona id:", typeof (id))

        }

    }, [])

    const handleClose = () => {
        navigate(-1);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const readImage = new FileReader();
            readImage.onloadend = () => {

                setImage(readImage.result)
                setCardInfo({ ...cardInfo, image: readImage.result })
                setShow(false);
            }
            readImage.readAsDataURL(file);

        }
    }

    const handleChange = (e) => {
        setCardInfo({ ...cardInfo, [e.target.name]: e.target.value })
    }

    const handleDelete = async() => {

        const isConfirmed = window.confirm("Are you sure you want to delete this item?");
        if(isConfirmed && id){
            console.log("cardInfo:",cardInfo)
            console.log("personaID delete:",id)
            console.log("persona id type :",typeof(id))
            await deletePersona({
                variables:{
                    persona_id:parseInt(id)
                }
            })
        }        

    }

    const handleRichTextChange = (e, richTextName) => {
        setCardInfo({ ...cardInfo, [richTextName]: e })
    }

    const handleUpdate = async () => {

        console.log("cardInfo:", cardInfo)

        if(id){

            await updatePersona({
                variables: {
    
                    updatePersonaInput: {
                        personaId: parseInt(id),
                        image: cardInfo.image,
                        name: cardInfo.name,
                        quote: cardInfo.quote,
                        description: cardInfo.description,
                        motivations: cardInfo.motivations,
                        pain_points: cardInfo.painPoints,
                        jobs_needs: cardInfo.jobNeeds,
                        activities: cardInfo.activities,
                    }
    
                }
            })

        } else{

            await addPersona({
                variables: {
    
                    createPersonaInput: {
                        image: cardInfo.image,
                        name: cardInfo.name,
                        quote: cardInfo.quote,
                        description: cardInfo.description,
                        motivations: cardInfo.motivations,
                        pain_points: cardInfo.painPoints,
                        jobs_needs: cardInfo.jobNeeds,
                        activities: cardInfo.activities,
                    }
    
                }
            })
            
        }

        

    }

    return (
        <>
            <img src={cardInfo.image}></img>
            <div className='editNameImage'>
                <div>
                    <label style={{ fontSize: "20px" }}>Name:</label>
                    <input type="text"
                        name="name"
                        value={cardInfo.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <button className='editImageBtn' onClick={handleShow}>Change Image</button>
                </div>
            </div>

            {show &&
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginLeft: "500px" }}></input>
            }

            <div className='textArea'>
                <div>

                    <h4>Notable Quote</h4>
                    <textarea
                        name="quote"
                        value={cardInfo.quote}
                        placeholder='Enter a quote that identifies the persona'
                        rows={10}
                        cols={65}

                        style={{ resize: "none" }}
                        onChange={handleChange}
                    />
                </div>
                <div>

                    <h4>Description</h4>
                    <textarea
                        name="description"
                        placeholder='Enter a general description/bio about the persona'
                        value={cardInfo.description}
                        rows={10}
                        cols={65}
                        style={{ resize: "none" }}
                        onChange={handleChange}
                    />
                </div>
                <div>

                    <h4>Attitudes/Motivations</h4>
                    <textarea
                        name="motivations"
                        placeholder='What mindset does persona have?'
                        value={cardInfo.motivations}
                        rows={10}
                        cols={65}
                        style={{ resize: "none" }}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className='richText'>
                <div>
                    <h4>Pain Points</h4>
                    <ReactQuill
                        theme="snow"
                        name="painPoints"
                        value={cardInfo.painPoints}
                        onChange={(e) => handleRichTextChange(e, "painPoints")}
                    />
                </div>
                <div>
                    <h4>Jobs/Needs</h4>
                    <ReactQuill
                        theme="snow"
                        name="jobNeeds"
                        value={cardInfo.jobNeeds}
                        onChange={(e) => handleRichTextChange(e, "jobNeeds")}
                    />
                </div>
                <div>
                    <h4>Activites</h4>
                    <ReactQuill
                        theme="snow"
                        name="activities"
                        value={cardInfo.activities}
                        onChange={(e) => handleRichTextChange(e, "activities")}
                    />
                </div>
            </div>

            <div className='btns'>
                <p className='deleteBtn' onClick={handleDelete}>DELETE</p>
                <div>
                    <button className='updateBtn' onClick={handleClose} >Close</button>
                    <button className='updateBtn' onClick={handleUpdate}>Update Persona</button>
                </div>
            </div>


        </>

    )
}

export default SavePersona