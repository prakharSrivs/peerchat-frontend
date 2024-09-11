// @ts-nocheck
import { cn } from "@/lib/utils";
import DotPattern from "@/components/magicui/dot-pattern";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Backdrop, ButtonBase, Grid2, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { generateFromString } from 'generate-avatar'
import { SocketContext } from "@/providers/SocketProvider";
import ReactPlayer from 'react-player'
import Peer from 'peerjs';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const styles = {
    meetingCard:{
        border:"0.5px solid grey",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        cursor:"pointer",
        fontFamily:"Open Sans"
    },
    copyIcon:{
        fontSize:"18px",
        marginLeft:"10px",
        cursor:'pointer'
    },
    avatarStyles:{
        background:"white",
        borderRadius:"50px",
        overflow:"hidden",
        "&img":{
            borderRadius:"50%"
        },
        border:"none"
    },
    avatarContainer:{
        width:"100%",
        height:"100%",
        paddingBottom:"100px"
    },
    avatarName:{
        fontSize:"9px",
        color:"white",
        paddingTop:"10px"
    },
    localPlayer:{
        position:"absolute",
        zIndex:1000,
        right:0,
        bottom:0,
    },
    playerControl:{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        border:"2px solid white",
        borderRadius:"50%",
        margin:"40px 0",
        padding:"10px",
        color:"white"
    },
    playerControlsContainer:{
        position:"absolute",
        bottom:"0",
        gap:"50px"
    }
}

const RoomNavbar = ()=>{

    const { id } = useParams();
    const [copied, setCopied] = useState(false);

    return (
        <div className="w-screen h-50 flex justify-between items-center px-10 py-2">
            <Typography variant="h4" m={"20px"}  fontWeight={700} fontFamily={"Honk"} color="initial">
                Peer Chat 📹
            </Typography>
            <CopyToClipboard
                text={id}
                onCopy={()=>setCopied(true)}
            >
                <div 
                    className="py-2 px-4 rounded bg-black text-white" 
                    style={styles.meetingCard} 
                    onMouseLeave={() => setTimeout(()=>setCopied(false),2000)}

                >
                    {
                        copied ? <> Copied </> :
                        <>
                        Room Id - {id}
                        <ContentCopyIcon sx={styles.copyIcon} />
                        </>
                    }
                </div>
            </CopyToClipboard>
        </div>
    )
}

const Avatar = ({ email, handleCall, peerId })=>{
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleCallClick = ()=>{
        handleCall(peerId);
        handleClose();
    }
  
    return (
      <div className="m-10">
        <ButtonBase
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={styles.avatarStyles}
        >
            <img 
                src={`data:image/svg+xml;utf8,${generateFromString(email)}`} 
                width={"70px"} 
                height={"70px"}
                style={{borderRadius:"50%"}}
            />
        </ButtonBase>
        <Typography sx={styles.avatarName}>{email}</Typography>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          { localStorage.email !== email && <MenuItem onClick={handleCallClick}>Call</MenuItem>}
        </Menu>
      </div>
    );
}

const RenderAllAvatars = ({ participantsList, handleCall })=>{
    return (
        <div className="flex justify-center items-center" style={styles.avatarContainer} >
            {
                participantsList.map(({ email, peerId }, index:number)=>{
                    return <Avatar key={index} peerId={peerId} email={email} handleCall={handleCall} />
                })
            }
        </div>
    )
}

const PlayerControls = ({ handleCallDisconnect })=>{
    return (
        <Grid2 sx={styles.playerControlsContainer} className={"flex justify-center items-center"}>
            <ButtonBase sx={styles.playerControl} onClick={handleCallDisconnect} ><CallEndIcon /></ButtonBase>
            <ButtonBase sx={styles.playerControl}  ><VideocamIcon /></ButtonBase>
            <ButtonBase sx={styles.playerControl} ><VolumeUpIcon /></ButtonBase>
        </Grid2>
    )
}

const VideoCallBackdrop = ({ remoteStream, localStream, backdropOpen, handleClose, handleCallDisconnect })=>{

    return (
        <Backdrop open={backdropOpen} onClick={handleClose} >
            { localStream && <ReactPlayer style={styles.localPlayer} height={"200px"} muted playing url={localStream} />}
            { remoteStream && <ReactPlayer height={window.innerHeight} width={window.innerWidth} muted playing url={remoteStream} />}
            {
                localStream && remoteStream && <PlayerControls handleCallDisconnect={handleCallDisconnect} />
            }
        </Backdrop>
    )
}

const Room = () => {

    const email = localStorage.getItem("email");
    const navigate = useNavigate();
    const { id:roomId } = useParams();
    const [participantsList, setParticipantsList] = useState([]);
    const socket = useContext(SocketContext);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [backdropOpen, setBackdropOpen] = useState(false);
    const [peerId, setPeerId] = useState("");
    const peerInstance = useRef(null);

    const handleUserUpdate = (data)=>{
        setParticipantsList(data);
    }

    const handleCall = (remotePeerId) => {
        console.log(remotePeerId);
        setBackdropOpen(true);
        var getUserMedia = navigator.getUserMedia
    
        getUserMedia({ video: true, audio: true }, (mediaStream) => {
            setLocalStream(mediaStream);
            const call = peerInstance.current.call(remotePeerId, mediaStream)
    
            call.on('stream', (stream) => {
                setRemoteStream(stream);
            });
        });
    }

    const handleStopStream = (stream)=>{
        const tracks = stream?.getTracks() || []
        tracks.forEach( track => track.stop() )
    }

    const handleCallDisconnect = ()=>{
        peerInstance.current.disconnect();
        setRemoteStream(null);
        setLocalStream(null);
        setBackdropOpen(false);
        handleStopStream(localStream);
    }

    useEffect(()=>{
        if( !email ) navigate('/');  
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id)
            socket.emit("user:joined",{ roomId, email, username: undefined, peerId: id });
        });
        peer.on('call', (call) => {
            setBackdropOpen(true);
            var getUserMedia = navigator.getUserMedia 
            getUserMedia({ video: true, audio: true }, (mediaStream) => {
                setLocalStream(mediaStream);
                call.answer(mediaStream)
                call.on('stream', function(stream) {
                    setRemoteStream(stream);
                });
            });
        })
        peer.on('disconnected',()=>{
            setRemoteStream(null);
            setLocalStream(null);
            setBackdropOpen(false);
            handleStopStream(localStream);
        })
        socket.on("user:update", handleUserUpdate);
        peerInstance.current = peer;

        return ()=>{
            socket.off("user:update", handleUserUpdate);
        }
    },[])

  return (
    <div className='w-screen h-screen overflow-hidden bg-black' >
        <DotPattern className={cn("[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]")} />
        <RoomNavbar />
        <RenderAllAvatars handleCall={handleCall} participantsList={participantsList} />
        <VideoCallBackdrop 
            remoteStream={remoteStream} 
            localStream={localStream} 
            backdropOpen={backdropOpen}
            handleClose={() => setBackdropOpen(false)} 
            handleCallDisconnect={handleCallDisconnect}
        />
    </div>
  )
}

export default Room