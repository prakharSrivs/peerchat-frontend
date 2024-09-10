import Typography from '@mui/material/Typography'
import './styles.css'
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {

    const navigate = useNavigate();

  return (
    <div 
        className='flex flex-col gap-40 justify-start items-center bg-black h-screen w-screen'  
        style={{background:"#397FF1", paddingTop:"150px"}}      
    >
        <Typography variant="h1" fontWeight={700} fontFamily={"Honk"} color="initial">
            Peer Chat 📹
        </Typography>
        <Box 
            className="w-max flex justify-center gap-40"
        >
            <button className="homeButton" onClick={()=>navigate('/lobby/join')}>
                Join Meeting
            </button>
            <button className="homeButton" onClick={()=>navigate('/lobby/create')}>
                Create Meeting
            </button>
        </Box>
    </div>
  )
}

export default CreateRoom