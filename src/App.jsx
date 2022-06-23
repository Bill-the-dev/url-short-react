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
import Col from 'react-bootstrap/Col'
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
            <Button className="m-1" onClick={copy}>Copy to Clipboard</Button>
            <Button className="m-1" href={shortUrl.link} target="_blank" rel="noreferrer">Open in New Tab</Button>
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
      <br />

      {/* Current Group Details */}
      <Card className="mx-auto" style={{ width: '70vw' }}>
        <Card.Header as="h4">Current Group Detail</Card.Header>
        <Card.Body>
          <dl className="row">
            <dt className="col-sm-3">Name</dt>
            <dd className="col-sm-9">{currentGroup.name}</dd>
            <dt className="col-sm-3 text-truncate">Group ID</dt>
            <dd className="col-sm-9">{currentGroup.guid}</dd>
            <dt className="col-sm-12">Clicks by Country (30 days)</dt>
            <dd className="col-sm-12">
              <ListGroup className='.list-group-flush'>
              {(!groupMetrics.length)
                ? <ListGroup.Item>No Metrics</ListGroup.Item>
                : groupMetrics.map((country, idx) => (
                  <ListGroup.Item key={idx} className='d-flex align-items-start'>
                    <Col className="fw-bold col-sm-3" >{country.value}
                    </Col>
                    <Col className="fw-bold col-sm-9" >
                      <Badge bg="secondary" pill>{country.clicks}</Badge>
                    </Col>
                  </ListGroup.Item>
                ))
              }
              </ListGroup>
            </dd>
            <dt className="col-sm-12">Group Links</dt>
            <dd className="col-sm-12">
              <ListGroup className='.list-group-flush'>
                {(currentLinks.length === 0)
                  ? <ListGroup.Item>No Links</ListGroup.Item>
                  : currentLinks.map((link, idx) => (
                    <ListGroup.Item key={idx} link={link.id} className='d-flex flex-column'>
                      <Col className="d-flex flex-row">
                        <Col className="fw-bold col-sm-3" >Title</Col>
                        <Col className="col-sm-9" >{link.title}</Col>
                      </Col>
                      <Col className="d-flex">
                        <Col className="fw-bold col-sm-3" >Short URL</Col>
                        <Col className="col-sm-9" ><Button className="p-0" variant="link" href={link.link} target="_blank" rel="noreferrer">{link.id}</Button></Col>
                      </Col>
                      <Col className="d-flex">
                        <Col className="fw-bold col-sm-3" >Original URL</Col>
                        <Col className="col-sm-9" ><Button className="p-0" variant="link" href={link.long_url} target="_blank" rel="noreferrer">{link.long_url}</Button></Col>
                      </Col>
                      <Col className="d-flex">
                        <Col className="fw-bold col-sm-3" >Created At</Col>
                        <Col className="col-sm-9" >{new Date(link.created_at).toLocaleString()}</Col>
                      </Col>
                      <Button className='col-sm-3 mt-3 mb-3' onClick={handleSelectLink}>Get Link Metrics</Button>
                    </ListGroup.Item>
                  ))
                }
              </ListGroup>
            </dd>
          </dl>
        </Card.Body>
      </Card>
      <br />

      {/* Current Link Metrics */}
      {(currentLinkId.length === 0 && linkMetrics)
        ? null
        : <Card className="mx-auto" style={{ width: '70vw' }}>
            <Card.Header as="h4">Link Metrics</Card.Header>
            <Card.Body>
            <dl className="row">
              <dt className="col-sm-3">Link</dt>
              <dd className="col-sm-9">{currentLinkId}</dd>
              <dt className="col-sm-3">Total Clicks</dt>
              <dd className="col-sm-9">{`${ linkMetrics.total_clicks } per ${linkMetrics.units} ${linkMetrics.unit}s`}</dd>
              <p><em>Upgrade account to access metrics by city, device type, and more.</em></p>
            </dl>
            </Card.Body>
          </Card>
      }
      <br />
      
      {/* Update Current Group */}
      <Card className="mx-auto" style={{ width: '70vw' }}>
        <Card.Header as="h4">Update Group Details</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit('updateGroup')}>
            <Form.Group className='mb-3'>
              <Form.Label>Group Name: </Form.Label>
              <Form.Control type="text" defaultValue='' placeholder={currentGroup.name} id="group-name-input" onChange={handleGroupChange('name')} autoComplete='off'></Form.Control>
            </Form.Group>
            <Button type="submit">Submit Changes</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default App;
