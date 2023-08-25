import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
} // we defined an interface called PerspectiveViewerElement that behaves like a HTMLelement.

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    }; // this is what we plot, at these specific timestamps. This way the trader will see the name of the stock
       // and the time at which th stock was at that top_ask_price.

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); // create a y-line plot (x-y graph in maths terms)
      elem.setAttribute('column-pivots', '["stock"]'); // this says: "data attributed to different stock names should be treated separately"
                                                       // the above makes sense, since we want to see the top_ask_price for different stocks,
                                                       // so it would be really inconvenient if we plotted it as just one graph.

      elem.setAttribute('row-pivots', '["timestamp"]'); // this says "the x-axis represents time (i.e. the timestamps.)."
      elem.setAttribute('columns','["top_ask_price"]'); // this says "Plot only the top_ask_price, we don't care about anything else."
      elem.setAttribute('aggregates',`
      {"stock":"distinct count",
      "top_ask_price":"avg",
      "top_bid_price":"avg",
      "timestamp":"distinct count"}`); // this handles duplicates over the same timestamp by taking an average
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
