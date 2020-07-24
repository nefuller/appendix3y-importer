import * as React from 'react';
import { Appendix3YInfo } from '../../shared/Appendix3YInfo';
import './ResultsTable.css';

export interface ResultsTableProps {
  data: Appendix3YInfo[]
}

class ResultsTable extends React.Component<ResultsTableProps> {
  constructor(props: ResultsTableProps) {
    super(props);
  }
  
  render() {
    return (
      <div>
        <table id="results">
          <tbody>
            {this.renderTableHeader()}
            {this.renderTableData()}
          </tbody>
        </table>
      </div>
    );
  }

  renderTableHeader() {
    return (
      <tr>
        <th>ID</th>
        <th>Filename</th>
        <th>Entity</th>
        <th>ABN</th>
        <th>Name</th>
        <th>Last Notice</th>
        <th>Is Indirect</th>
        <th>Indirect Description</th>
        <th>Changed</th>
        <th>Prev Held</th>
        <th>Class</th>
        <th>Acquired</th>
        <th>Disposed</th>
        <th>Value/Consideration</th>
        <th>Curr. Held</th>
        <th>Nature</th>
        <th>Error</th>
      </tr>
    );
  }

  renderTableData() {
    let key = 0;
    return this.props.data.map((data) => {
      return (
        <tr key={++key}>
          <td>{key}</td>
          <td>{data.filename}</td>
          <td>{data.entity}</td>
          <td>{data.abn}</td>
          <td>{data.name}</td>
          <td>{new Date(data.dateOfLastNotice).toLocaleDateString()}</td>
          <td>{data.isIndirectInterest ? 'True' : 'False'}</td>
          <td>{data.indirectInterestDescription}</td>
          <td>{new Date(data.dateOfChange).toLocaleDateString()}</td>
          <td>{data.numSecuritiesPrevHeld}</td>
          <td>{data.securityClass}</td>
          <td>{data.numSecuritiesAcquired}</td>
          <td>{data.numSecuritiesDisposed}</td>
          <td>{data.value}</td>
          <td>{data.numSecuritiesCurrHeld}</td>
          <td>{data.natureOfChange}</td>
          <td>{data.error}</td>
        </tr>
      );
    });
  }
}
 
export default ResultsTable;