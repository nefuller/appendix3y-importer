import * as React from 'react';
import { FileDrop } from 'react-file-drop';
import ResultsTable, { ResultsTableProps } from './ResultsTable';
import './App.css';

interface AppState {
  data: any[]
}

export class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = { 
      data: []
    };
  }
  
  render() {
    const styles = { border: '2px solid black', width: 600, color: 'black', padding: 20 };

    return (
      <div id='page'>
        <div id='title'>
          <h1>Appendix3Y Change of Director's Interest Notice Importer</h1>
        </div>
        <div id='file-drop-wrapper' >
          <div style={styles}>
            <FileDrop onDrop={(files, event) => this.onDrop(files, event)}>
              <h3>Drag and drop Appendix3Y forms here!</h3>
            </FileDrop>       
          </div>
          <div id='download-csv'>
            <p>When ready, use the button below to generate a .csv file from your imported Appendix3Y's...</p>
            <button disabled={this.state.data.length < 1} onClick={(event) => this.onGenerateCSVClick(event)}>Generate CSV</button>
          </div>          
        </div>
        <div id='results'>
          <h2>Results</h2>
          <ResultsTable data={this.state.data}/>
        </div>
      </div>
    );
  }

  onDrop(files: FileList, event: React.DragEvent) {
    if (files.length < 1) {
      return;
    }
  
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(`file${i}`, files[i], files[i].name);
    }

    fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    }).then(async (response) => {
      const updatedData = this.state.data;
      updatedData.push(...await response.json());

      this.setState({ data: updatedData });
    }).catch((err) => {
      console.log(err);
    });
  }

  onGenerateCSVClick(event: React.MouseEvent) {
    fetch('http://localhost:3000/csv', {
      method: 'POST',
      body: JSON.stringify(this.state.data)
    }).then(async (response) => {
      return await response.blob();
    }).then((blob) => {
      const hiddenElement = document.createElement('a');
      hiddenElement.href = URL.createObjectURL(blob);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'download.csv';
      hiddenElement.click();
    }).catch((err) => {
      console.log(err);
    });
  }
};

