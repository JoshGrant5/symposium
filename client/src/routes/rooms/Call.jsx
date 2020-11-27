import Animal from "react-animals";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";


const Video = (props) => {
  console.log('props', props);
  const ref = useRef();

  useEffect(() => {
    console.log('in use effect');
    props.peer.on("stream", stream => {

      
      console.log('IN useEFFECT stream', stream);
      // console.log('getTracks', stream.getTracks()[0].enabled);
      // stream.getTracks()[0].enabled = props.active;
      // console.log('getTracks after false', stream.getTracks()[0].enabled);

      ref.current.srcObject = stream;
    })
  }, [props]);

  console.log('IN useEFFECT ref', ref);
  return (
    <video className='call-video other' playsInline autoPlay ref={ref} />
  );
}

/*
* ROOM COMPONENT - the actual chat between the peers
Every person who joins has a unique socket object created for them by socket.io. 
We will hold an array of objects in our peersRef array where the object will be a socket id to an actual peer object. This will allow us to create handshakes with each individual peer as they come and go.

When a person joins the room:
1. Assuming there are already others in the room, this person is now the initiator. 
2. They will notify everyone that they have joined. 
3. The server in turn will send them back an array of every other participant other than themselves, and for each one they will create a new peer using the createPeer function. 
4. The function creates a peer with initiator set to true, so we can immediatley emit the signal that we will be sending back to the others as soon as the construction of the peer happens. 

For people already in the room:
1. They will get notified by the server that someone else has joined.
2. They will receive a payload/newcomer object and call the addPeer function.
3. The function will create a peer with initiator set to false because we don't need the signal to be sent out right away. 
4. We accept the incoming signal, then take our own signal, fire it to server, and then it is sent back to the person who initially sent the joining signal.

For the person awaiting to join the room:
1. They will be listening until they received a returned signal.
2. They receive a payload/participant object
3. They dig through their array of peers to make sure they signal on the correct peer. 
4. They are now potentially receving x amount of signals based on who is in the room, so we need to know which one of the peers to use to accept the returning signal. 
*/

export default function Call(props) {
  console.log('Rerender');
  const [peers, setPeers] = useState([]);

  // We keep track of the changes in the following refs without having to rerender the component
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  // Current state of users video
  const [isActive, setIsActive] = useState(true);


  // videoState to show video or avatar
  const [mediaStream, setMediaStream] = useState(true);

  const roomID = props.roomID;

  // TURN VIDEO ON AND OFF
  const toggleVideo = () => {
      

    console.log('userVideo.current.srcObject', userVideo.current.srcObject.getTracks()[0].enabled);
    console.log('peersRef.current[0].peer', peersRef.current[0].peer);

    peersRef.current[0].peer.removeStream(userVideo.current.srcObject)
    userVideo.current.srcObject.getTracks()[0].enabled = false;
    isActive ? setIsActive(false) : setIsActive(true);

    console.log('isActive', isActive);
      
  };

  // useEffect runs when someone joins the room
  useEffect(() => {
    socketRef.current = io.connect("/");
    // Get user's audio and video
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      // userVideo is a ref to the actual video (stream)
      userVideo.current.srcObject = stream;

      console.log('MY STREAM IS', stream);

      //* A NEW USER JOINS A ROOM WITH EXISTING PARTICIPANTS
      // Emit an event saying the user has joined the room
      socketRef.current.emit('join room', roomID);
      // get array of users (everyone in chat except from themselves)
      socketRef.current.on('all users', users => {
        // We have no peers yet because we have just joined. Create a peers array for rendering purposes as we need to know how many videos to render
        const peers = [];
        // iterate through each user in the room, creating a peer for each
        users.forEach(userID => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerID: userID, // the socketID for person we just created a peer for
            peer // the peer object returned the from createPeer function
          });
          peers.push({
            peerID: userID,
            peer,
          });
        });
        // Update Peers State
        setPeers(peers);
      });

      //* A PERSON ALREADY IN THE ROOM IS NOTIFIED THAT SOMEONE ELSE HAS JOINED
      socketRef.current.on('user joined', payload => {
        // Create a peer for the newcomer who just joined the room
        // Pass as paramaters signal, who is calling us, and our stream
        const peer = addPeer(payload.signal, payload.callerID, stream);

        peersRef.current.push({
          peerID: payload.callerID,
          peer
        });

        //Object that includes peer and their id to make unique keys for the video components
        const peerObj = {
          peer,
          peerID: payload.callerID
        }
        // Update Peers State by adding the newly joined user to the existing array of participants
        setPeers(users => [...users, peerObj]);
        props.timer(true);
      });

      //* THE JOINING USER GETS THEIR RESPONSE
      socketRef.current.on('receiving returned signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      })

      socketRef.current.on('conversation started', () => {
        props.timer(true);
      });

    });

    // LEAVING USER
    socketRef.current.on("user left", id => {
      const peerObj = peersRef.current.find(p => p.peerID === id);
      if (peerObj) {
        peerObj.peer.destroy();
      }

      const peers = peersRef.current.filter(p => p.peerID !== id);

      peersRef.current = peers;
      setPeers(peers);
    })

    // Updates newMessage state triggering useEffect in ChatBox.jsx
    socketRef.current.on("update chat box", messageInfo => {
      if (messageInfo.message) {
        props.setNewMessage({ messageInfo })
      }
    });

  }, [roomID]);

  // CHAT BOX 
  useEffect(() => {
    // Message goes to server.js which broadcasts "update chat box" to all other users in the room
    socketRef.current.emit("new message", { message: props.message, userId: socketRef.current.id })
  }, [props.message]);

  //* Function for creating peers when a user has joined a room with existing participants
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    // The newly constructed peer emits a signal immediately because we set initiator to true. This starts the peer-to-peer handshake
    peer.on('signal', signal => {
      // Emit signal down to the server, sending an object with the userID of everyone already in room, the joining user's ID, and the actual signal data
      socketRef.current.emit('sending signal', { userToSignal, callerID, signal })
    });

    return peer;
  }

  //* Function for creating a new individual peer for the person joining the room
  function addPeer(incomingSignal, callerID, stream) {
    // initiator set to false so signal is not fired on creation of Peer
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    // This will fire when it is notified that someone wants to make a connection with it
    peer.on('signal', signal => {
      // Receives incoming signal, and sends a signal back out to the server, which sends a signal to the callerID that called 
      socketRef.current.emit('returning signal', { signal, callerID });
    });

    // triggers the on 'signal' command above
    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <>
      <div className='call-container'>
        <video className='call-video me' muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer) => {
            return (
              <Video key={peer.peerID} peer={peer.peer} />
            )         
        })}
      </div>
      <button onClick={toggleVideo}>TOGGLE VIDEO</button>
    </>
  );
} 