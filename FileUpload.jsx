import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import $ from 'jquery';
import DropDown from '../components/controls/DropDown';
import CheckBox from '../components/controls/CheckBox';
import RadioButtonGroup from '../components/controls/RadioButton';
import { EditText, EditTextarea } from 'react-edit-text';
import { Dropdown, Card, Button } from 'react-bootstrap';
import { FaShare } from 'react-icons/fa'
import Accordion from 'react-bootstrap/Accordion'
import '../styles/FileUpload.css';
import cancelimg from '../assets/images/cancel.png'
import fullscreenimg from '../assets/images/full-screen.png'
import pinimg from '../assets/images/pin.png'
import viewimg from '../assets/images/view.png'
import editimg from '../assets/images/edit.png'
import closeimg from '../assets/images/close.png'
import arrowimg from '../assets/images/arrow.png'
import searchimg from '../assets/images/search.png'
import CustomScroll from 'react-custom-scroll';
import 'react-custom-scroll/dist/customScroll.css';
import fileUploadClient from '../apiClient/fileUploadClient'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#0b97d4',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  transition: 'border .3s ease-in-out'
};

const activeStyle = {
  borderColor: '#0b97d4'
};

const acceptStyle = {
  borderColor: '#0b97d4'
};

const rejectStyle = {
  borderColor: '#0b97d4'
};

const ResponseData={ "Name_match": 0, 
                     "Name_match_percent": "NO", 
                     "Proof_type": "Passport", 
                     "Photo_match": "No Photo Uploaded ", 
                     "Photo_match_percent": "", 
                     "Signature_match": "No Signature Uploaded", 
                     "Proof_Data": {
                       "Full Name": "YUAN, LINGFENG", 
                       "Surname": "YL", 
                       "ID number": "E79075756", 
                       "Country code": "CHN", 
                       "Type": "P", 
                       "Nationality": "CHINESE", 
                       "Sex": "M", 
                       "Date of birth": "10 SEP 1989", 
                       "Place of Birth": "SICHUAN", 
                       "Place of Issue": "SICHUAN", 
                       "Issuing Authority": "MPS Exit & Entry Administration", 
                       "Date of Issue": "13 APR 2016", 
                       "Date of Expiry": "12 APR 2026"
                      }
                      }

function FileUpload(props) {
  const [uploadedfiles, setUploadedFiles] = useState([]);
  const [filedata,setupdatefile]=useState([]);
  const [DocTypeSource, setDocTypeSource] = React.useState([]);
  const [SelectedFilesPanels, setSelectedFilesPanels] = useState([]);
  const [allcontenttypes, setallcontenttypes] = useState([])
  const [isSelectAll, setisSelectAll] = useState(false)
  React.useEffect(() => {

    var uniqueContenttypes = [];
    var contenttypeCount = 0;
    var tempcontent = [];
    allcontenttypes.map((item) => {
      if (tempcontent.indexOf(item.contentType) === -1) {
        tempcontent.push(item.contentType)
        uniqueContenttypes.push({ "contentTypeID": contenttypeCount++, "contentType": item.contentType })
      }
    })
    setDocTypeSource(uniqueContenttypes)
  }, [allcontenttypes])


  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
 
    setUploadedFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      byte:new Uint8Array(file),
      isSelected: false
    })));
    setupdatefile(acceptedFiles.map(file => Object.assign(file, {
     file
    })))
    console.log(filedata)
  }, []);


  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: '.jpeg,.jpg,.xlsx,.png,.bmp,.msword,.pdf,.plain'
  });


  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);
  function fileSelectionChanges(selecedFile) {
    let updateFiledetails = uploadedfiles
    updateFiledetails.forEach(eachfile => {
      if (eachfile.name == selecedFile.name)
        eachfile.isSelected = !eachfile.isSelected
    })

    setUploadedFiles([...updateFiledetails])
  }
  function DocTypeChange(selectedDocType) {
    if (SelectedFilesPanels.length > 0) {
      let alreadyPanelPresent = SelectedFilesPanels.filter((eachpanel) => { return eachpanel.ContentType == selectedDocType.contentType }).length > 0
      if (alreadyPanelPresent) {
        let selectedFilesPanels = [...SelectedFilesPanels]
        selectedFilesPanels.filter(eachpanel => {
          if (eachpanel.ContentType == selectedDocType.contentType) {
            eachpanel.Files = eachpanel.Files.concat(uploadedfiles.filter(eachfile => { return eachfile.isSelected }))
          }
        })
        setSelectedFilesPanels(selectedFilesPanels)
        setUploadedFiles(uploadedfiles.filter(eachfile => !eachfile.isSelected));
      }
      else {
        var newContentType = {
          "ContentType": selectedDocType.contentType,
          "Files": uploadedfiles.filter(eachfile => { return eachfile.isSelected }),
          "FileWithValues": []
        };
        setSelectedFilesPanels(
          [...SelectedFilesPanels, newContentType]
        )
        setUploadedFiles(uploadedfiles.filter(eachfile => !eachfile.isSelected));
      }
    }
    else {
      var newContentType = {
        "ContentType": selectedDocType.contentType,
        "Files": uploadedfiles.filter(eachfile => { return eachfile.isSelected }),
        "FileWithValues": []
      };
      setSelectedFilesPanels(newContentType)
      let currentuploadedfiles = [...uploadedfiles]
      currentuploadedfiles = currentuploadedfiles.filter(eachfile => !eachfile.isSelected)

      setUploadedFiles([...currentuploadedfiles])

    }
    setisSelectAll(false)
  }

  const changeDropdownvalue = (event, contenttype, type) => {

    if (type == "bulk") {
      let currentContentType = [...allcontenttypes];
      currentContentType.forEach((eachcontentType) => {
        if (eachcontentType.contentType == contenttype.contentType && eachcontentType.name == contenttype.name)
          eachcontentType.value = event[0].value
      })
      setallcontenttypes(currentContentType)
    }
    else if (type == "row") {

    }
  }
  const EditTextChanges = (event, contenttype, type, selctedfile, colname) => {

    if (type == "bulk") {
      let currentContentType = [...allcontenttypes];
      currentContentType.forEach((eachcontentType) => {
        if (eachcontentType.contentType == contenttype.contentType && eachcontentType.name == contenttype.name)
          eachcontentType.value = event.value
      })
      setallcontenttypes([...currentContentType])
    }
    else if (type == "row") {
      let allPanelDetails = [...SelectedFilesPanels]
      allPanelDetails.forEach((eachpanel) => {
        if (eachpanel.ContentType == contenttype.ContentType)
          eachpanel.FileWithValues.forEach((eachfilewithValue) => {
            if (eachfilewithValue.path == selctedfile.path) {
              eachfilewithValue[colname] = event.value
            }
          })
      })
      setSelectedFilesPanels([...allPanelDetails])
    }
  }
  const changeCheckboxValue = (event, contenttype, type) => {
    if (type == "bulk") {
      let currentContentType = [...allcontenttypes];

      currentContentType.forEach((eachcontentType) => {
        if (eachcontentType.contentType == contenttype.contentType && eachcontentType.name == contenttype.name)
          eachcontentType.value = !eachcontentType.value
      })
      setallcontenttypes(currentContentType)
    }
    else if (type == "row") {

    }
  }


  const changeDateValue = (event, contenttype, type) => {
    if (type == "bulk") {
      let currentContentType = [...allcontenttypes];
      currentContentType.forEach((eachcontentType) => {
        if (eachcontentType.contentType == contenttype.contentType && eachcontentType.name == contenttype.name)
          eachcontentType.value = event
      })
      setallcontenttypes([...currentContentType])
    }
    else if (type == "row") {

    }
  }
  const changeRadioValue = (event, contenttype, type) => {
    if (type == "bulk") {
      let currentContentType = [...allcontenttypes];
      currentContentType.forEach((eachcontentType) => {
        if (eachcontentType.contentType == contenttype.contentType && eachcontentType.name == contenttype.name)
          eachcontentType.value = event.target.value
      })
      setallcontenttypes(currentContentType)
    }
    else if (type == "row") {

    }
  }
  const ApplyValuetoEachFile = (event, selectedPanel) => {
    let currentPanelValues = [...SelectedFilesPanels]
    let selectedContentType = allcontenttypes.filter((eachcontentType) => { return eachcontentType.contentType == selectedPanel.ContentType })
    let objectvalueGeneration = {};
    selectedContentType.forEach((Eachtype) => {
      objectvalueGeneration[Eachtype.name] = Eachtype.type == "date" ? new Date(Eachtype.value).toLocaleDateString() : Eachtype.value
    })
    currentPanelValues.forEach((eachpanel) => {
      if (selectedPanel.ContentType == eachpanel.ContentType) {
        eachpanel.FileWithValues = [];
        eachpanel.Files.forEach((eachfile) => {
          eachpanel.FileWithValues.push({ ...eachfile, ...objectvalueGeneration });
        })
      }
    })
    setSelectedFilesPanels([...currentPanelValues])
  }
  const EditRowSelected = (currpanel, currentfile) => {

    let Allpanel = [...SelectedFilesPanels];
    Allpanel.forEach((eachpanel) => {
      if (eachpanel.ContentType == currpanel.ContentType)
        eachpanel.FileWithValues.forEach((eachfile) => {
          if (eachfile.path == currentfile.path)
            eachfile.isEdit = !eachfile.isEdit
        });
    })
    setSelectedFilesPanels([...Allpanel])
  }
  const selectAllFilesevent = (event) => {
    let updateFiledetails = uploadedfiles
    updateFiledetails.forEach(eachfile => {
      eachfile.isSelected = !isSelectAll
    })
    setisSelectAll(!isSelectAll)
    setUploadedFiles([...updateFiledetails])
  }
  function getcontentTypes() {
    fileUploadClient.getContentTypes()
      .then(allcontentType => {
        allcontentType.forEach((eachtype) => {
          if (eachtype.type == "select") {
            let Choices = [];
            eachtype.Choice.forEach((eachchoice) => {
              Choices.push({ "lable": eachchoice, "value": eachchoice })
            })
            eachtype.Choice = Choices;
          }
        })

        setallcontenttypes(allcontentType)
      })
  }

function FileReaderfn(file){
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
        resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
        reject(error);
    };
});
}

  const convertImageData = async (file) => {
   
    FileReaderfn(file).then(function(resultfile){
     console.log(resultfile)
   

    const base64 = resultfile.split(/,(.+)/)[1];
     console.log("base64 : ", base64);
    var requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "Signature": "",
        "First name": "",
        "Middle name": "",
        "Last name": "",
        "Photo": "",
        "Proof": base64,
      })
    };


    const apiUrl = "https://bip-aws.aspiresys.com:5000/proof_verification";

     fetch(apiUrl, requestOptions)

      .then((res) => {
        console.log(res)
        res.json()})
    })
  }

 //Submit Function
 const handleSubmit =(fileData)=>
 {  
  var requestOptions = {
     method: 'POST',
     mode: 'cors',
     headers: {
       "Content-Type": "application/json"
     },
     body: JSON.stringify({
     "ContentType": "item",
    "LibName":"POCFileUpload", 
    "items": 
    [{
    "File":fileData,
    "name":"download.png",
    "contenttypes":
    [{ "contentType": "Item", "name": "metaData1", "type": "text", "Choice": null,"value":"2323" },
     { "contentType": "Item", "name": "metaData2", "type": "text", "Choice": null,"value":"test" }] }, 
     {
     "File":fileData,
     "name":"download.png",
     "contenttypes":
     [{ "contentType": "Item", "name": "metaData1", "type": "text", "Choice": null,"value":"232" },
      { "contentType": "Item", "name": "metaData2", "type": "text", "Choice": null,"value":"223" }] }] 
     })
   };


   const apiUrl = "https://localhost:44376/file/AddListItems";

    fetch(apiUrl, requestOptions)

     .then((res) => {
       console.log(res)
      })
   

 }

  //Method to load a value

  const loadValues=(selectedFile)=>{
    let isContentTypeAssigned=allcontenttypes.filter(item=>item.contentType==ResponseData.Proof_type)
    var FileName={'path':selectedFile.name}
    var FilesWithValue=Object.assign({},ResponseData.Proof_Data,FileName)
       if(isContentTypeAssigned.length>0)
       {
         if(SelectedFilesPanels.length==0)
         {
          var newContentType ={
          "ContentType": ResponseData.Proof_type,
          "Files":[],
          "FileWithValues": [FilesWithValue]
        };
        setSelectedFilesPanels( [...SelectedFilesPanels, newContentType]);
        }
        else 
        {
          let isAddedtoPanel=SelectedFilesPanels.filter(item=>item.ContentType==ResponseData.Proof_type)
          if(isAddedtoPanel.length==0)
          {
            var newContentType ={
              "ContentType": ResponseData.Proof_type,
              "Files":[],
              "FileWithValues": [FilesWithValue]
            };
            setSelectedFilesPanels( [...SelectedFilesPanels, newContentType]);
          }
          else
          {
            let selectedFilesPanels = [...SelectedFilesPanels]
            selectedFilesPanels.filter(eachpanel => {
              if (eachpanel.ContentType == ResponseData.Proof_type) {
                eachpanel.FileWithValues = eachpanel.FileWithValues.concat(FilesWithValue)
              }
            })
            setSelectedFilesPanels(selectedFilesPanels)
          }
        }
        let currentuploadedfiles = [...uploadedfiles]
        let selected=[];
        selected=currentuploadedfiles.filter(item=>item.name!=selectedFile.name.toString());
        setUploadedFiles([...selected])
       }
       else
       {
         alert("No Content Type Associated with this Data")
       }
  }
  // clean up
  React.useEffect(() => () => {
    uploadedfiles.forEach(file => !file.preview && URL.createObjectURL(file.preview));
  }, [uploadedfiles]);
  React.useEffect(() => {


    getcontentTypes()

  }, [])
  return (
    <div className="top2 row col-md-12">
      <section className={" col-xs-12 override1 " + (uploadedfiles.length > 0 ? "col-md-9" : "col-md-12")}>
        <div className='browsesection' {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <div className='custom-file-upload'>
            <p>Drag and drop your files here  or</p>
            <p>Browse a files to upload</p>
          </div>
        </div>

        {SelectedFilesPanels.map((eachpanel) => (

          <div className="col-md-12 top1">
            <Accordion >
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                    {eachpanel.ContentType}
                    <label className="uploadcontents">{eachpanel.Files.length}</label>
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>

                    <div className="panel-body">

                      <div className="detailssection">
                        <p className="panelname">Details</p>
                        <div className="row top1">
                          <div className="col-md-12 col-xs-12">
                            <div className="row">
                              {allcontenttypes.map((allcontenttype) =>
                                (allcontenttype.contentType == eachpanel.ContentType) &&
                                <div className={"col-xs-12 " + (allcontenttype.type == "textarea" ? "col-md-12" : "col-md-4")}>
                                  <p className="side-title">{allcontenttype.name}</p>
                                  {(allcontenttype.type == "text") &&
                                    <EditText
                                      name={allcontenttype.name}
                                      placeholder={"Enter " + allcontenttype.name}
                                      className="subject-field"
                                      onSave={(event) => EditTextChanges(event, allcontenttype, 'bulk')}
                                      onChange={(event) => EditTextChanges(event, allcontenttype, 'bulk')}
                                      value={allcontenttype.value}
                                    />
                                  }
                                  {(allcontenttype.type == "textarea") &&

                                    <EditTextarea
                                      name={allcontenttype.name}
                                      placeholder={"Enter " + allcontenttype.name}
                                      className="subject-field"
                                      onSave={(event) => EditTextChanges(event, allcontenttype, 'bulk')}
                                      onChange={(event) => EditTextChanges(event, allcontenttype, 'bulk')}
                                      value={allcontenttype.value}
                                    />
                                  }
                                  {(allcontenttype.type == "checkbox") &&

                                    <CheckBox
                                      DisplayName=" "
                                      name={allcontenttype.name}
                                      isChecked={allcontenttype.value}
                                      //  checkboxChangeEvent={changeCheckboxValue}
                                      checkboxChangeEvent={(event) => changeCheckboxValue(event, allcontenttype, 'bulk')}
                                    />
                                  }
                                  {
                                    (allcontenttype.type == "select") &&
                                    <DropDown
                                      name={allcontenttype.name}
                                      labelValue=" "
                                      placeholderValue={'Select' + allcontenttype.name}
                                      isClearable={true}
                                      classValue={'form-items__dropdown-icon'}
                                      options={allcontenttype.Choice}
                                      required={false}
                                      labelField={'lable'}
                                      values={allcontenttype.value}
                                      //valueField={'SDMSOwnerName'}
                                      OnChange={(event) => changeDropdownvalue(event, allcontenttype, 'bulk')}
                                      valueField={'value'}
                                    />
                                  }
                                  {(allcontenttype.type == "radio") &&
                                    <RadioButtonGroup
                                      values={allcontenttype.Choice}
                                      RadioButtonEvent={(event) => changeRadioValue(event, allcontenttype, 'bulk')}></RadioButtonGroup>
                                  }
                                  {(allcontenttype.type == "date") &&

                                    <DatePicker selected={allcontenttype.value} className="subject-field"
                                      onChange={(event) => changeDateValue(event, allcontenttype, 'bulk')} />
                                  }

                                </div>
                              )}
                            </div>

                            <div className="pull-right">
                              <button className="cancel-btn">Reset</button>
                              <button onClick={(event) => handleSubmit(eachpanel)} className="save-btn">Apply</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="clearfix">
                        <button className="enterdetails-btn">Enter Details</button>
                      </div>
                      {eachpanel.FileWithValues.length > 0 &&
                        <div className="table-responsive">
                          <table className="table top1">
                            <thead>
                              <tr>
                                <th><input type="checkbox" /></th>
                                <th>FileName</th>
                                {allcontenttypes.map((allcontenttype) =>
                                  (allcontenttype.contentType == eachpanel.ContentType) &&
                                  <th>{allcontenttype.name}</th>)}
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>


                              {eachpanel.FileWithValues.map((eachfile) => (
                                <tr>
                                  <td><input type="checkbox" /></td>
                                  <td>{eachfile.path}</td>
                                  {allcontenttypes.map((allcontenttype) =>
                                    (allcontenttype.contentType == eachpanel.ContentType && (eachfile.isEdit ?
                                      (<td>
                                        {(allcontenttype.type == "text") &&
                                          <EditText
                                            name={allcontenttype.name}
                                            placeholder={"Enter " + allcontenttype.name}
                                            className="subject-field"
                                            onSave={(event) => EditTextChanges(event, eachpanel, 'row', eachfile, allcontenttype.name)}
                                            onChange={(event) => EditTextChanges(event, eachpanel, 'row', eachfile, allcontenttype.name)}
                                            value={eachfile[allcontenttype.name]}
                                          />
                                        }
                                        {(allcontenttype.type == "textarea") &&

                                          <EditTextarea
                                            name={allcontenttype.name}
                                            placeholder={"Enter " + allcontenttype.name}
                                            className="subject-field"
                                            onSave={(event) => EditTextChanges(event, eachpanel, 'row', eachfile, allcontenttype.name)}
                                            onChange={(event) => EditTextChanges(event, eachpanel, 'row', eachfile, allcontenttype.name)}
                                            value={eachfile[allcontenttype.name]}
                                          />
                                        }
                                        {(allcontenttype.type == "checkbox") &&

                                          <CheckBox
                                            DisplayName=" "
                                            name={allcontenttype.name}
                                            isChecked={allcontenttype.value}
                                            //  checkboxChangeEvent={changeCheckboxValue}
                                            checkboxChangeEvent={(event) => changeCheckboxValue(event, allcontenttype, 'row')}
                                          />

                                        }
                                        {(allcontenttype.type == "select") &&
                                          <DropDown
                                            name={allcontenttype.name}
                                            labelValue=" "
                                            placeholderValue={'Select' + allcontenttype.name}
                                            isClearable={true}
                                            classValue={'form-items__dropdown-icon'}
                                            options={allcontenttype.Choice}
                                            required={false}
                                            labelField={'lable'}
                                            values={allcontenttype.value}
                                            //valueField={'SDMSOwnerName'}
                                            OnChange={(event) => changeDropdownvalue(event, allcontenttype, 'row')}
                                            valueField={'value'}
                                          />
                                        }
                                        {(allcontenttype.type == "radio") &&
                                          <RadioButtonGroup
                                            values={allcontenttype.Choice}
                                            RadioButtonEvent={(event) => changeRadioValue(event, allcontenttype, 'row')}></RadioButtonGroup>
                                        }
                                        {(allcontenttype.type == "date") &&

                                          <DatePicker selected={allcontenttype.value} className="subject-field"
                                            onChange={(event) => changeDateValue(event, allcontenttype, 'row')} />
                                        }</td>)
                                      :
                                      (<td>   {(allcontenttype.contentType == eachpanel.ContentType) && eachfile[allcontenttype.name]}</td>))))}

                                  <td><a href="#"><img className="iconspace" src={viewimg} /></a><a href="#" onClick={() => EditRowSelected(eachpanel, eachfile)} ><img className="iconspace" src={editimg} /></a><img className="iconspace" src={closeimg} /><img className="iconspace" src={arrowimg} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      }
                    </div>

                  </Card.Body>
                </Accordion.Collapse>
              </Card>

            </Accordion>


          </div>))}
      </section>
      {uploadedfiles.length > 0 && <aside className="col-md-3 col-xs-12 sidenavbar override2" id="commenttext">
        <section>
          <div className="clearfix">
            <p id="addcomment" className="addcomment partialdiv1">
              <i className="fa fa-angle-down fa-down" aria-hidden="true">
              </i> Upload  files  <label className="uploadcontents">{uploadedfiles.length}</label></p>

            <div className="dropdown partialdiv2">


              <Dropdown>
                <Dropdown.Toggle className="btn btn-primary dropdown-toggle doc-btnactive" variant="success" id="dropdown-basic">
                  Document Type</Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu">
                  {DocTypeSource.map((eachDocType) => (
                    <Dropdown.Item
                      onClick={() => DocTypeChange(eachDocType)}
                      eventKey={eachDocType.contentTypeID + 1}>{eachDocType.contentType}</Dropdown.Item>
                  ))};
              </Dropdown.Menu>
              </Dropdown>
            </div>






          </div>
          <div className="top1">
            <CheckBox
              DisplayName=" "

              isChecked={isSelectAll}
              name="Select All"
              //  checkboxChangeEvent={changeCheckboxValue}
              checkboxChangeEvent={(event) => selectAllFilesevent(event)} />
            <label className="fileselection">Select all files</label>
          </div>

          <div className="row doscroll" >
            <CustomScroll heightRelativeToParent="calc(100% - 20px)">
              <div className="col-md-12 col-xs-12">
                <div className="row top2">
                  {uploadedfiles.map((eachfile) => (

                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <p>
                            <CheckBox
                              DisplayName=" "

                              isChecked={eachfile.isSelected}
                              name={eachfile.name}
                              //  checkboxChangeEvent={changeCheckboxValue}
                              checkboxChangeEvent={() => fileSelectionChanges(eachfile)}
                            />
                            <img src={cancelimg} className="rightside" /><img src={fullscreenimg} className="rightside" /><FaShare onClick={()=>loadValues(eachfile)} className="rightside" /></p>
                        </div>
                        <div className="card-body">
                          <p>
                            <img
                              src={eachfile.preview}
                              alt={eachfile.name} className="previewfile-image"
                            /></p>
                        </div>
                        <div className="card-footer">
                          <p><label className="fileextension">{eachfile.name && eachfile.name.length > 25
                            ? `${eachfile.name.substring(0, 23)}..`
                            : eachfile.name}</label><img src={pinimg} className="rightside pin-img" /></p>
                        </div>
                      </div>
                    </div>

                  ))}
                </div>


              </div>
            </CustomScroll>
          </div>

        </section>
      </aside>}
    </div>
  )
}

export default FileUpload;