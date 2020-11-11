import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import {Col, Row} from 'react-bootstrap';
import React from 'react';

//import MCTSTree from "./MCTSTree";
import '../board.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  format_square_value(val) {
    if (typeof (val) === "number") {
      return val.toFixed(2)
    } else {
      return val
    }
  }

  renderSquare(i) {
    return <Square
      value={this.format_square_value(this.props.squares[i])}
      onClick={() => this.props.onClick(i)}
    />;

  }

  render() {

    const height = this.props.height;
    const width = this.props.width;

    let squares = [];
    for (var i = 0; i < height; i++) {
      let row = [];
      for (var j = 0; j < width; j++) {
        let square = this.renderSquare(i * width + j)
        row.push(square);
      }
      squares.push(<div key={i} className="board-row">{row}</div>)
    }
    return (
      <div>{squares}</div>
    );
  }
}

function OutputDist(props) {
  if (props.game === "tictactoe") {
    console.log("Render output dist for tictactoe")
    return <Board
      height={props.height}
      width={props.width}
      squares={props.squares}
    />
  } else if (props.game === "connect4") {
    return <Board
      height={1}
      width={props.width}
      squares={props.squares}
    />
  }
  console.log("OUTPUT DIST RENDER NAN")
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      board_height: this.props.board_height,
      board_width: this.props.board_width,
      board_num_squares: props.board_height * props.board_width,
      board: Array(props.board_height * props.board_width).fill(null),
      history: [{squares: Array(props.board_height * props.board_width).fill(null)}],
      stepNumber: 0,
      xIsNext: true,
      player: props.player,
      playAgent: true,
      agent: props.agent,
      game: this.props.game,
      board_probs: Array(props.action_size).fill(0),
      board_values: Array(props.action_size).fill(0),
      mcts_probs: Array(props.action_size).fill(0),
      winner: 0
    };

    this.calculateWinner = this.calculateWinner.bind(this);
    this.resetGame = this.resetGame.bind(this);

  }

  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    if (props.game !== state.game) {
      return {
        game: props.game,
        board_height: props.board_height,
        board_width: props.board_width,
        board_num_squares: props.board_height * props.board_width,
        board: Array(props.board_height * props.board_width).fill(null),
        history: [{squares: Array(props.board_height * props.board_width).fill(null)}],
        player: props.player,
        agent: props.agent,
        board_probs: Array(props.action_size).fill(0),
        board_values: Array(props.action_size).fill(0),
        mcts_probs: Array(props.action_size).fill(0),
      };
    }
    return null;
  }

  componentDidMount() {
    this.getAlphaOpinion(this.state.board);
  }

  async getAlphaOpinion(board) {

    if (this.state.winner !== 0){
      return;
    }
    const game = this.state.game;
    //const player = this.state.player;
    const player = this.props.player;
    // Now call
    console.log("Get alpha opinion")
    console.log(player)
    console.log(game)
    console.log(board)
    const response = await fetch("/alpha_opinion", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({board: board, player: player, env_name: game})
    });

    console.log("Getting respone")
    const data = await response.json();

    if (response.ok) {
      this.setState({
        board_probs: data["p"],
        board_values: data["v"],
        mcts_probs: data["mcts_p"]
      })
    }

  }

  async getNextState(board, action) {

    console.log("Get Next State")
    const response = await fetch("/get_next_state", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: action, env_name: this.state.game,
        board: board
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("NEXT STATE SET");
      this.setState({
        board: data["board"]
      })

      console.log(this.state.board)
      this.calculateWinner(this.state.board)
      this.getAlphaOpinion(this.state.board);

    }
  }

  async calculateWinner(squares) {
    // Now call
    const response = await fetch("/is_win", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({env_name: this.state.game, board: squares})
    });

    const data = await response.json();

    if (response.ok) {
      this.setState({
        winner: data["win"]
      })
    }


  }

  async handleClick(i) {
    const agent = this.state.agent;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const current_squares = current.squares.slice();
    const env_name = this.state.game;
    const squares = current.squares.slice();

    if (this.state.winner !== 0) {
      return;
    }

    console.log("Calling get next state")
    console.log(this.state.board)
    this.getNextState(this.state.board, i);
    console.log("New state")
    console.log(this.state.board);

    if (this.state.playAgent) {

      console.log("Agent Make Move!!!!!")
      // Now call
      const response = await fetch("/make_move", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({action: i, agent: agent, board: current_squares, player: 1, env_name: env_name})
      });

      const data = await response.json()

      if (response.ok) {
        this.setState({
          history: history.concat([{
            squares: data.board,
          }]),
          board: data.baord,
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext
        })

        this.calculateWinner(this.state.board)
        this.getAlphaOpinion(this.state.board);
      }
    }


  }

  playAgent() {
    this.setState({playAgent: !this.state.playAgent});
  }

  async resetGame(event) {
    const response = await fetch("/new_game", {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({agent: this.state.agent, game: this.state.game, env_name: this.state.game})

    });

    if (response.ok) {
      this.setState({
        history: [{squares: Array(this.state.board_num_squares).fill(null)}],
        board: Array(this.state.board_num_squares).fill(null),
        stepNumber: 0,
        xIsNext: true,
        winner: 0
      });
    }

    this.getAlphaOpinion(this.state.board);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.state.winner;
    const probs = this.state.board_probs;
    const mcts_probs = this.state.mcts_probs;
    const values = this.state.board_values;

    const game = this.state.game;
    const player = this.props.player;
    const agent = this.props.agent;

    let status;

    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = 'Next player:' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <Container>
        <Row>
          <Col>
            <h1>Game</h1>
            <h4>Player = {player}</h4>
            <h4>Agent = {agent}</h4>
            <h4>Game = {game}</h4>
            <h4>{status}</h4>
            <div className="game">
              <div className="game-board">
                <Board
                  height={this.props.board_height}
                  width={this.props.board_width}
                  squares={this.state.board}
                  onClick={(i) => this.handleClick(i)}
                />
              </div>
            </div>
            <Button variant={"primary"} onClick={this.resetGame}>New Game</Button>
          </Col>
          <Col>
            <h2> Alpha Probs</h2>
            <div className="game">
              <div className="game-board">
                <OutputDist
                  game={this.state.game}
                  height={this.props.board_height}
                  width={this.props.board_width}
                  squares={probs}
                />
              </div>
            </div>
          </Col>
          <Col>
            <h2> MCTS Probs</h2>
            <div className="game">
              <div className="game-board">
                <OutputDist
                  game={this.state.game}
                  height={this.props.board_height}
                  width={this.props.board_width}
                  squares={mcts_probs}
                />
              </div>
            </div>
          </Col>
          <Col>
            <h2> Alpha Values</h2>
            <div className="game">
              <div className="game-board">
                <OutputDist
                  game={this.state.game}
                  height={this.props.board_height}
                  width={this.props.board_width}
                  squares={values}
                />
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    );
  }
}

// ========================================


export default Game;
