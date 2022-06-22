import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const urlLink = 'https://api-ssl.bitly.com/v4/bitlinks';
  const urlGroup = 'https://api-ssl.bitly.com/v4/groups';
  const token = process.env.REACT_APP_BITLY_TOKEN
  
  const [currentGroup, setCurrentGroup] = useState({})
  const [currentLinks, setCurrentLinks] = useState([])
  const [currentLinkId, setCurrentLinkId] = useState('')
  const [linkMetrics, setLinkMetrics] = useState({})
  const [groupsList, setGroupsList] = useState([])
  const [longUrl, setLongUrl] = useState('')
  
  useEffect(() => {
    // console.log(getShortLink())
    getGroupsList()
  }, [])

  useEffect(() => {
    if (groupsList.length > 0) {
      getGroup(groupsList[0].guid)
    }
  }, [groupsList])

  useEffect(() => {
    if (currentGroup.guid) {
      getGroupLinks(currentGroup.guid)
    }
  }, [currentGroup])

  useEffect(() => {
    if (currentLinkId.length > 1) {
      getLinkMetrics(currentLinkId)
    }
  }, [currentLinkId])
  

  const getGroupsList = async() => {
    try {
      let response = await axios.get(urlGroup, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      // console.log(response.data.groups)
      setGroupsList(response.data.groups)
    } catch (error) {
      alert(error)
    }
  }

  const getGroup = async(groupId) => {
    try {
      let response = await axios.get(`${urlGroup}/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log(response.data)
      setCurrentGroup(response.data)
    } catch (error) {
      alert(error)
    }
  }

  // why link separate? Large data pull?
  const getGroupLinks = async(groupId) => {
    try {
      let response = await axios.get(`${urlGroup}/${groupId}/bitlinks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data.links);
      setCurrentLinks(response.data.links);
    } catch (error) {
      alert(error);
    }
  }

  const updateGroupName = async(groupId, form) => {
    debugger
    try {
      let response = await axios.patch(`${urlGroup}/${groupId}`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
      setCurrentGroup(response.data);
    } catch (error) {
      alert(error);
    }
  }

  const getShortLink = async() => {
    try {
      let response = await axios.post(urlLink, {
        "long_url": "https://www.linkedin.com/in/bill-camarco/",
        "domain": "bit.ly",
        "group_guid": "Bm6lbqGKXai",
        "title": "LinkedIN Profile",
        "tags": [
          "bitly",
          "api"
        ]
      }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log(response.data)
    } catch(error) {
      alert(error)
    }
  };

  // --- LINK METRICS ---
  const handleSelectLink = (e) => {
    let parentLi = e.target.parentElement
    let linkId = parentLi.getAttribute('link')
    console.log(linkId)
    setCurrentLinkId(linkId)
  }

  const getLinkMetrics = async(linkId) => {
    try {
      let response = await axios.get(`${urlLink}/${linkId}/clicks/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
      setLinkMetrics(response.data);
    } catch (error) {
      alert(error);
    }
  }


  // --- FORM METHODS ---

  const [formValue, setFormValue] = useState({
    name: currentGroup.name,
  })

  const handleSubmit = (type) => {
    debugger
    switch (type) {
      case 'updateGroup':
        debugger
        return (e) => {
          e.preventDefault();
          debugger
          updateGroupName(currentGroup.guid, formValue)
        }
    
      default:
        
    }
  }

  const handleChange = (type) => {
    return (e) => setFormValue({
      ...formValue,
      [type]: e.currentTarget.value
    })

  }

  return (
    
    <main className="App"> 
      {/* Group List */}
      <h4>{`Groups (${groupsList.length}):`}</h4>
      <ol> 
        {(groupsList.length === 0)
          ? <li>No Groups</li>
          : groupsList.map((group, idx) => (
            <li key={idx}>
              <span>Name: {group.name}</span>
              <br />
              <span>Active: {(group.is_active) ? 'true' : 'false'}</span>  
            </li>
          ))
        }
      </ol>
      <br />
      
      {/* Current Group Detail */}
      <h4>Current Group: </h4>
      <ul className='ul c-group-ul'>
        <li>Name: {currentGroup.name}</li>
        <li>ID: {currentGroup.guid}</li>
        <li>Links: 
          <ul className='ul c-group-links-ul'>
            {(currentLinks.length === 0)
              ? <li>No Links</li>
              : currentLinks.map((link, idx) => (
                <li key={idx} link={link.id}>
                  <span>Title: {link.title}</span>
                  <br />
                  <span>Short Link: {<a href={link.link} target="_blank">{link.id}</a>}</span>
                  <br />
                  <span>Original Link: {<a href={link.long_url} target="_blank">{link.long_url}</a> }</span>
                  <br />
                  <span>Created At: {new Date(link.created_at).toLocaleString()}</span>
                  <br />
                  <button onClick={handleSelectLink}>Get Link Metrics</button>
                  <br /><br />
                </li>
              ))
            }
          </ul>
        </li>
      </ul>

      {/* Current Link Metrics */}
      {(currentLinkId.length === 0 && linkMetrics)
        ? null
        : <div>
            <h4>Link Metrics:</h4>
            <span>Link: {currentLinkId}</span>
            <br />
            <span>Total Clicks: {linkMetrics.total_clicks} per {linkMetrics.units} {linkMetrics.unit}s</span>
            <span></span>

          </div>

      }



      {/* Update Current Group */}
      <h4>Update Group Details:</h4>  
      <form onSubmit={handleSubmit('updateGroup')}>
        <label>Group Name: 
          <input type="text" defaultValue='' placeholder='Enter new name' id="group-name-input" onChange={handleChange("name")}/>
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
};

export default App;
