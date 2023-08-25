import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean, // We want to have 1: data to plot, and 2:
                      // the ability to turn the graph on and off.
                      // Both are required properties of this interface.
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [],
      showGraph: false //Here we set the graph to not show up until we press the show graph button.
                       //This makes sense, since a trader would like to interact with the website
                       //by, say, pressing buttons.
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    if (this.state.showGraph) {
      return (<Graph data={this.state.data}/>) // This condition ensures that the graph only shows when the
                                               // button is pressed by the trader.
    }
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    let x = 0; //this keeps track of time
    const interval = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        this.setState({
        data: serverResponds,    // we tell the computer: 'Hey, please plot the data from serverResponds!'
        showGraph: true,         // this switches the state of the graph from 'off' to 'on'
        }); // the previous two are simply the requirements of the interface called IState.
      });
      x++; // with every time we run this, time increases
      if (x>1000) {
        clearInterval(interval) // we update the data that the graph shows every 1000 iterations, while
                                // keeping it continuous
      }
    }, 100);
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
