import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import {change} from 'redux-form';
import {Button, Table} from 'react-bootstrap';
import Plupload from 'react-plupload';

export default class PluploadType extends Component {

  static propTypes = {
    'field': PropTypes.object.isRequired,
    'properties': PropTypes.object.isRequired,
    'size': PropTypes.string,
    'formName': PropTypes.string.isRequired,
    'dispatch': PropTypes.func.isRequired
  };

  render() {
    const {properties, field, dispatch} = this.props;

    let allFiles = properties.value || [];
    const extraProps = {};
    if (properties.touched && properties.error) {
      extraProps.bsStyle = 'error';
    }
    if (properties.touched && properties.error) {
      extraProps.help = properties.error;
    }

    const stateChange = (plupload) => {
      if (plupload.state === 2) { // Starting with uploading
        this.setState({pending: true});
        return true;
      }

      this.setState({pending: false});
    };

    const addedFiles = (plupload, files) => {
      const fileList = [];
      _.map(files, (file)=> {
        fileList.push(file.name);
      });
    };

    const fileUploaded = (plupload, file, response) => {
      const uploadResponse = JSON.parse(response.response);
      if (_.get(field, 'multi_selection', true) === false) {
        allFiles = [];
        allFiles.push(uploadResponse.result);
      } else {
        allFiles.push(uploadResponse.result);
      }

      dispatch(change(this.props.formName, field.name, allFiles));

    };

    const fileDelete = (index) => {
      _.set(allFiles, [index], _.merge(_.get(allFiles, [index]), {deleted: 1}));
      dispatch(change(this.props.formName, field.name, allFiles));
    };

    const renderTable = () => {
      return (
        <Table striped bordered condensed hover>
          <thead>
          <tr>
            <th>Bestand</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {_.map(properties.value, (file, key) => {
            if (!file.deleted) {
              return (
                <tr key={key}>
                  <td>{file.file_original_name} {file.deleted}</td>
                  <td><Button onClick={() => { fileDelete(key); }}><i className="fa fa-trash-o"></i></Button></td>
                </tr>
              );
            }
          })}
          </tbody>
        </Table>
      );
    };

    return (
      <div key={field.name} className="formgroup">
        <label className={field.labelClassName + ' control-label'}>{field.label}</label>
        <div className={field.wrapperClassName}>
          <Plupload
            key={field.name}
            id="plupload"
            runtimes="html5"
            multipart
            chunk_size="1mb"
            url={field.url}
            multi_selection={_.get(field, 'multi_selection', true)}
            flash_swf_url={_.get(field, 'flash_swf_url', '/plupload-2.1.8/js/Moxie.swf')}
            onFilesAdded={addedFiles}
            onStateChanged={stateChange}
            onFileUploaded={fileUploaded}
            autoUpload
            headers={field.headers || {}}
            />
          {renderTable()}
        </div>
      </div>
    );
  }
}
