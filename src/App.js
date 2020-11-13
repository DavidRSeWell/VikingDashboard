import React, {useState} from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form'
import Navbar from 'react-bootstrap/Navbar';
import ConnectGame from './components/ConnectGame.js'

import './App.css';
import {Col, Row} from 'react-bootstrap';

function GetGame(props) {
  if (props.game === "tictactoe") {
    return <ConnectGame game={"tictactoe"} agent={props.agent} player={props.player} board_height={3} board_width={3} action_size={9}/>
  } else if (props.game === "connect4") {
    return <ConnectGame game={"connect4"} agent={props.agent} player={props.player} board_height={6} board_width={7} action_size={42}/>
  }

}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      game: "connect4",
      player: "1",
      agent: "alphago"
    };

    this.setAgent = this.setAgent.bind(this);
    this.setGame = this.setGame.bind(this);
    this.setPlayer = this.setPlayer.bind(this);
  }

  setAgent(event) {
    this.setState({agent: event.target.value})
  }

  setGame(event) {
    this.setState({game: event.target.value})
  }

  setPlayer(event) {
    this.setState({player: event.target.value})
  }

  render() {
    return (
      <Container>
        <Navbar bg="light">
          <Navbar.Brand href="#home">VikingZero</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Form.Group>
            <Form.Row>
              <Col>
                <Form.Control size={"md"} as="select" value={this.state.game} onChange={this.setGame}>
                  <option value="tictactoe">TicTacToe</option>
                  <option value="connect4">Connect4</option>
                </Form.Control>
              </Col>
              <Col>
                <Form.Control size={"md"} as="select" value={this.state.player} onChange={this.setPlayer}>
                  <option value="1">p1</option>
                  <option value="2">p2</option>
                </Form.Control>
              </Col>
            </Form.Row>
          </Form.Group>
        </Navbar>
       <Row>
          <Col>
            <GetGame agent={this.state.agent} player={this.state.player} game={this.state.game} />
          </Col>
        </Row>
      </Container>
    )
  }
}

export default App;
