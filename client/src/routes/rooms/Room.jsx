import { useState, useEffect } from 'react';

import TopNav from './TopNav';
import Call from './Call';
import ChatBox from './ChatBox';
import Info from './Info';

import './room.scss';

import axios from 'axios';

export default function Room(props) {

  // STATE
  const [conversation, setConversation] = useState([{}]);
  const [category, setCategory] = useState("");
  const [timer, setTimer] = useState(false);

  // For ChatBox
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState({});

  // ROOM ID
  const roomID =  props.match.params.roomID;

  // State Helper Functions
  const changeTimer = (newValue) => {
    setTimer(newValue)
  };

  const changeMessage = newValue => {
    setMessage(newValue);
  };

  // After message is rendered on page update message state so that is can send duplicate messages
  useEffect(() => {
    setMessage("")
  }, [message])

  const changeNewMessage = newValue => {
    setNewMessage(newValue);
  };


  // Use Effects
  useEffect(() => {
    axios.get(`/api/conversations/${roomID}`).then((res) => {
      setConversation(res.data.conversation)
      const categoryID = res.data.conversation[0].category_id;
      
      axios.get(`/api/categories/${categoryID}`).then((res) => {
        setCategory(res.data.categoryName.name)
      });
      
    });
  }, [roomID]);

  return (
    <article className="room">

      <TopNav 
      title = {conversation[0].title}
      creatorID = {conversation[0].creator_id}
      history = {props.history}
      timer = {timer}
      />

      <div className="main">
        <div className="side-bar">
          <Info 
            title = {conversation[0].title}
            description = {conversation[0].description}
            podcast_name = {conversation[0].podcast_name}
            episode_title = {conversation[0].podcast_episode_title}
            category = {category}
            podcast_image = {conversation[0].podcast_image}
            url = {props.history.location.pathname}
            embed_title = {conversation[0].podcast_episode_title}
            embed_url = {conversation[0].podcast_episode_embed_url}
          />
          <ChatBox 
            setMessage = {changeMessage}
            newMessage = {newMessage}
          />
        </div>

        <Call 
          roomID = {roomID} 
          timer = {changeTimer}
          message = {message}
          setNewMessage = {changeNewMessage}
          />
      </div>

    </article>
  );
}