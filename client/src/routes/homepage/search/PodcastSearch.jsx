import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import './searchBar.scss'
const axios = require('axios');

// PodcastSearch Component fetches podcast data from the Itunes API, passing down the results and the user input as props
export default function PodcastSearch(props) {
  const { changeEpisodeInfo } = props

  // Name to insert into Itunes API 
  const [term, setTerm] = useState("");
  // The results fetched from the API
  const [results, setResults] = useState([]);
  // The value of the selected podcast
  const [value, setValue] = useState("");

  // Stores the setValue function to pass down as props
  const changeValue = val => {
    setValue(val);
  }

  useEffect(() => {
    const url = `https://itunes.apple.com/search?term=${term}&entity=podcast`;
    axios.get(url).then(response => {
      response.header("Access-Control-Allow-Headers","*");
      response.header("crossorigin",true);
      console.log('response of initial query', response)
      setResults([...response.data.results])
      // Make second api call for specific podcasts
      const feedUrl = response.data.results[0].feedUrl;
      const url =  `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`
      axios.get(url).then(response => {
        const episodeData = response.data.items.map(ep => {
      
          return {embed_title: ep.title, embed_url: ep.enclosure.link};
        })
        if (changeEpisodeInfo) {
          changeEpisodeInfo(episodeData);
        }
      })
    })
    .catch(err => console.log('Error: ', err));
  }, [term, changeEpisodeInfo]);

  return (
      <div>
        <SearchBar 
          onSearch={term => setTerm(term)}
          changeValue = {changeValue}
          value = {value}
        />
        <SearchResults 
          results={results}
          state={props.state}
          changeValue = {changeValue}
          changePodcastInfo = {props.changePodcastInfo}
          changeInput = {props.changeInput}
        />
      </div>
  );
}