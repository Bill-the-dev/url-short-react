import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- BOOTSTRAP 
import Button from 'react-bootstrap/button';
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'
import Badge from 'react-bootstrap/Badge'
// import Alert from 'react-bootstrap/Alert';

const App = () => {
  const urlLink = 'https://api-ssl.bitly.com/v4/bitlinks';
  const urlGroup = 'https://api-ssl.bitly.com/v4/groups';
  const token = process.env.REACT_APP_BITLY_TOKEN
  
  const [currentGroup, setCurrentGroup] = useState({})
  const [groupMetrics, setGroupMetrics] = useState({})
  const [currentLinks, setCurrentLinks] = useState([])
  const [currentLinkId, setCurrentLinkId] = useState('')
  const [linkMetrics, setLinkMetrics] = useState({})
  const [groupsList, setGroupsList] = useState([])
  const [shortUrl, setShortUrl] = useState('')
  
  useEffect(() => {
    getGroupsList()
  }, [])

  useEffect(() => {
    // set first group as default
    if (groupsList.length > 0 && !currentGroup.values) {
      getGroup(groupsList[0].guid)
    }
  }, [groupsList])

  useEffect(() => {
    if (currentGroup.guid) {
      getGroupLinks(currentGroup.guid)
      getGroupMetrics(currentGroup.guid)
    }
  }, [currentGroup, currentGroup.links])

  useEffect(() => {
    if (currentLinkId.length > 1) {
      getLinkMetrics(currentLinkId)
    }
  }, [currentLinkId])
  
  const handleSelectGroup = (e) => {
    let parentLi = e.target.parentElement;
    let groupId = parentLi.getAttribute('groupid');
    getGroup(groupId);
  }


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
      setCurrentLinks(response.data.links);
    } catch (error) {
      alert(error);
    }
  }

  const getGroupMetrics = async(groupId) => {
    try {
      let response = await axios.get(`${urlGroup}/${groupId}/countries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data.metrics);
      setGroupMetrics(response.data.metrics)
    } catch (error) {
      alert(error);
    }
  }



  const updateGroupName = async(groupId, form) => {
    // debugger
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

  const getShortLink = async(longUrl, title) => {
    try {
      let response = await axios.post(urlLink, {
        "long_url": longUrl,
        "domain": "bit.ly",
        "group_guid": currentGroup.guid,
        "title": title,
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
      setShortUrl(response.data)
      // form reset needed
      // setLinkFormValue({
      //   longUrl: '',
      //   title: ''
      // })
    } catch(error) {
      alert(error)
    }
  };

  const copy = async() => {
    await navigator.clipboard.writeText(shortUrl.link);
    alert('Url copied');
  }


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

  const [groupFormValue, setGroupFormValue] = useState({
    name: currentGroup.name,
  })
  const [linkFormValue, setLinkFormValue] = useState({
    longUrl: '',
    title: ''
  })

  const handleSubmit = (type) => {
    // debugger
    switch (type) {
      case 'updateGroup':
        // debugger
        return (e) => {
          e.preventDefault();
          // debugger
          updateGroupName(currentGroup.guid, groupFormValue)
          e.target.reset()
        }
      case 'shortenLink':
        return (e) => {
          e.preventDefault();
          getShortLink(linkFormValue.longUrl, linkFormValue.title)
          // e.target.reset(); // only on success!
        }
      default:
    }
  }

  const handleUrlChange = (type) => {
    return (e) => setLinkFormValue({
      ...linkFormValue,
      [type]: e.currentTarget.value
    })
  }

  const handleGroupChange = (type) => {
    return (e) => setGroupFormValue({
      ...groupFormValue,
      [type]: e.currentTarget.value
    })
  }

  return (
    
    <Container className=""> 
      {/* Shorten Link */}
      <Card className="mx-auto" style={{ width: '70vw' }}>
        <Card.Header as="h4">Shorten a link</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit('shortenLink')}>
            <Form.Group className='mb-3'>
              <Form.Label>URL to shorten: </Form.Label>
              <Form.Control type='text' placeholder='Enter a URL' defaultValue={linkFormValue.longUrl} onChange={handleUrlChange('longUrl')} autoComplete='off'></Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Title: </Form.Label>
              <Form.Control type="text" defaultValue={linkFormValue.title} placeholder='Enter a title' id="group-name-input" onChange={handleUrlChange('title')} autoComplete='off'></Form.Control>
            </Form.Group>
            <Button type="submit">Get Short Link</Button>
          </Form>

        </Card.Body>
      </Card>
      <br />
      {(shortUrl.id)
        ? <Card className="mx-auto" style={{ width: '70vw' }}>
            <Card.Header as="h4">Shortened URL: </Card.Header>
            <Card.Body className='text-center'>
              <Card.Title as="h3">{shortUrl.id}</Card.Title>
              <Button onClick={copy}>Copy to Clipboard</Button>
              <Button href={shortUrl.link} target="_blank" rel="noreferrer">Open in New Tab</Button>
            </Card.Body>
          </Card>
        : null
      }
      <br />

      {/* Group List */}

      <Card className="mx-auto" style={{ width: '70vw' }}>
        <Card.Header as="h4">{`Groups (${groupsList.length}):`}</Card.Header>
        <Card.Body>
          <ListGroup defaultActiveKey="#link1">
            {(groupsList.length === 0)
              ? <ListGroup.Item>No Groups</ListGroup.Item>
              : groupsList.map((group, idx) => (
                <ListGroup.Item className="d-flex justify-content-between align-items-center" key={idx} groupid={group.guid}>
                  <div className="fw-bold">{group.name}</div>
                  <div>
                    {(group !== currentGroup)
                      ? <Badge bg="primary" pill>Current Group</Badge>
                      : <Button onClick={handleSelectGroup}>Group Details</Button>
                    }  
                    {(group.is_active) 
                      ? <Badge bg="success" pill>Active</Badge>
                      : <Badge bg="secondary" pill>Inactive</Badge>
                    }
                  </div>
                </ListGroup.Item>
              ))   
            }
            
          </ListGroup>
        </Card.Body>
      </Card>



      <h4>{`Groups (${groupsList.length}):`}</h4>
      <ol> 
        {(groupsList.length === 0)
          ? <li>No Groups</li>
          : groupsList.map((group, idx) => (
            <li key={idx} groupid={group.guid}>
              <span><b>Name:</b> {group.name}</span><br />
              <span><b>Active:</b> {(group.is_active) ? 'true' : 'false'}</span><br />
              {(group !== currentGroup)
                ? <Button disabled="disabled">Current Group</Button>
                : <Button onClick={handleSelectGroup}>Group Details</Button>
              }  
            </li>
          ))
        }
      </ol>
      <br />

      {/* <br /><br /><br />
      <h4>Create a Short Link</h4>
      <form onSubmit={handleSubmit('shortenLink')}>
        <label>URL to shorten:
          <input type="text" defaultValue={linkFormValue.longUrl} placeholder='Enter URL' id="group-name-input" onChange={handleUrlChange('longUrl')} autoComplete='off' />
        </label>
        <br />
        <label>Title:
          <input type="text" defaultValue={linkFormValue.title} placeholder='Enter URL Title' id="group-name-input" onChange={handleUrlChange('title')} autoComplete='off' />
        </label>
        <br />
        
        <button type="submit">Get Short Link</button>
        
      </form>

      {(shortUrl.id)
        ? <div>
            <p>Shortened URL: </p><br />
            <h4>{shortUrl.id}</h4><br />
            <Button onClick={copy}>Copy to Clipboard</Button>
            
            <a href={shortUrl.link} target="_blank" rel="noreferrer"><Button >Open in New Tab</Button></a>
          </div> 
        : null  
      } */}


      
      {/* Current Group Detail */}
      <h4>Current Group: </h4>
      <ul className='ul c-group-ul'>
        <li><b>Name:</b> {currentGroup.name}</li>
        <li><b>ID:</b> {currentGroup.guid}</li>
        <li> <b>Metrics by Country (per 30 days):</b>
          <ul className='ul c-group-metrics-ul'>
            {(!groupMetrics.length)
              ? <li>No Metrics</li>
              : groupMetrics.map((country, idx) => (
                <li key={idx}>
                  <span><b>{country.value}:</b> {country.clicks} clicks</span><br />
                </li>
              ))
            }
          </ul>
        </li>
        <li><b>Links:</b> 
          <ul className='ul c-group-links-ul'>
            {(currentLinks.length === 0)
              ? <li>No Links</li>
              : currentLinks.map((link, idx) => (
                <li key={idx} link={link.id}>
                  <span><b>Title:</b> {link.title}</span><br />
                  <span>Short Link: {<a href={link.link} target="_blank" rel="noreferrer">{link.id}</a>}</span><br />
                  <span>Original Link: {<a href={link.long_url} target="_blank" rel="noreferrer">{link.long_url}</a> }</span><br />
                  <span>Created At: {new Date(link.created_at).toLocaleString()}</span><br />
                  <Button onClick={handleSelectLink}>Get Link Metrics</Button>
                  <br />
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
            <br />
            <span><em>Upgrade account to access metrics by city, device type, </em></span>
          </div>
      }

      {/* Update Current Group */}
      <h4>Update Group Details:</h4>  
      <form onSubmit={handleSubmit('updateGroup')}>
        <label>Group Name: 
          <input type="text" defaultValue='' placeholder='Enter new name' id="group-name-input" onChange={handleGroupChange("name")} autoComplete='off'/>
        </label>
        <br />
        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
};

export default App;
