var docLib;
var projMasterItems;
var deptListItems;
var docTypeListItems;
var docLibFolders;
var userDept;
var userDeptIds = [];
var bussUnitId;
var commonFolderColl;
var proLib;
var proLib1 ;
var TodeleteSelectedArray = [];

$(document).ready(function () {

$('#anchrUploadProjectDocument').hide();
$('#anchrUploadProjectDocument1').hide();

$('#anchrUploadProjectDocument2').hide();

    proLib1 = GetParameterValues("proLib");

    proLib = proLib1.replace(/-/g, ""); 

    debugger
    if (proLib == undefined || proLib == null || proLib == "") {
        alert('The project does not have valid library to list the folders or files.');
          debugger
        location.href = 'https://sharepointistech.sharepoint.com/sites/TTAADMINHR/SitePages/TTA_MATTERMANAGEMENT/MatterManagement/TTA/MatterManagementLanding.aspx';
    }
    docLib = proLib.substring(proLib.lastIndexOf('/') + 1);
    if (docLib == undefined || docLib == null || docLib == "") {
        alert('The project does not have valid library to list the folders or files.');
          debugger
        location.href = 'https://sharepointistech.sharepoint.com/sites/TTAADMINHR/SitePages/TTA_MATTERMANAGEMENT/MatterManagement/TTA/MatterManagementLanding.aspx';
    }

    RoleMaster()

    $("#anchrProjDoc").attr("onclick", "getFolders(\"" + _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + docLib+ "')?$expand=ListItemAllFields,Author,Folders,Folders/ListItemAllFields,Folders/Folders,Files,Files/ListItemAllFields,Files/Author&$top=5000" + "\");");
debugger;   
 $("#anchrProjDoc").text(docLib);

    getFolders(_spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + docLib+ "')?$expand=ListItemAllFields,Author,Folders,Folders/ListItemAllFields,Folders/Folders,Files,Files/ListItemAllFields,Files/Author&$top=5000&$orderby=ListItemAllFields/created asc");

    var frmValid = $("#aspnetForm").validate({

        onfocusout: function (element) {
            this.element(element);
            if ($("#aspnetForm").valid()) {
                $("#btnUploadDoc").css("display", "inline-block");
            } else {
                $("#btnUploadDoc").css("display", "none");
            }
        },
        rules: {
            ddlFolders: "required",

        },

        messages: {
            ddlFolders: "Please select folder",
            ddlDocType: "Please select total value",
            txtReferenceNo: "Please enter reference no.",
            dtDocumentedDate: "Please enter date",

            ddlStatus: "Please select status",
            fileProjDoc: "Please select document",
        }
    });

});

var uniqueNames=[]

function selectRow(checkbox) {

    var row = $(checkbox).closest('tr');

    var nameValue = row.find('td:nth-child(2)').text().trim();

    if (checkbox.checked) {

        TodeleteSelectedArray.push(nameValue);
    } else {

        const index = TodeleteSelectedArray.indexOf(nameValue);
        if (index > -1) {
            TodeleteSelectedArray.splice(index, 1);
        }
    }

     uniqueNames = getUniqueIds(TodeleteSelectedArray);

    console.log('Unique selected rows:', uniqueNames);  

    const allCheckboxes = $(".rowCheckbox");
    const allSelected = allCheckboxes.length === $(".rowCheckbox:checked").length;
    $("#selectAll").prop("checked", allSelected);
}

function getUniqueIds(arr) {

    return [...new Set(arr)];
}

function createFolder() {
    const siteUrl = _spPageContextInfo.webAbsoluteUrl;

    var libraryName =proLib
    var subfolderName = $('#folderName').val().trim();

    if(subfolderName=="" ||subfolderName==undefined ||subfolderName==null ){
        alert('Plese Enter Folder Name!!');
        return false;
    }

    var folderName1=document.getElementById("ulProjDoc").innerText;

    var cleanedString ="";
    var folderName="";
    if(folderName1!="" && folderName1!=null && folderName1!=undefined){
         cleanedString =folderName1.split("\n") 
        .map(line => line.trim().replace("> ", "")) 
        .filter(line => line !== "") 
        .join("/"); 

         folderName=cleanedString+'/'+subfolderName;

    }
    else{
        folderName=subfolderName;

    }

    $.ajax({
        url: `${siteUrl}/_api/web/folders`,
        method: "POST",
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.Folder' },
            'ServerRelativeUrl': `${libraryName}/${folderName}`
        }),
        success: function () {

            $.ajax({
                url: `${siteUrl}/_api/web/folders`,
                method: "POST",
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                data: JSON.stringify({
                    '__metadata': { 'type': 'SP.Folder' },

                    'ServerRelativeUrl': `${libraryName}/${folderName}`

                }),
                success: function () {
                    $('#result').text('Folder and Subfolder created successfully.');

                    alert('Folder Created  Successfully');
                    window.location.href = window.location.href; 

                },
                error: function (error) {
                    $('#result').text('Error creating subfolder: ' + error.responseText);
                }
            });
        },
        error: function (error) {
            $('#result').text('Error creating folder: ' + error.responseText);
        }
    });
}

function deleteFolder() {
    console.log(TodeleteSelectedArray);

    if (TodeleteSelectedArray.length > 0) {

        const confirmDelete = confirm(`Are you sure you want to delete ${TodeleteSelectedArray.length} folders/files?`);
        if (!confirmDelete) {
            return false; 
        }

        const siteUrl = _spPageContextInfo.webAbsoluteUrl;
        const libraryName = proLib; 
        const folderNameElement = document.getElementById("ulProjDoc");
        const folderName1 = folderNameElement ? folderNameElement.innerText : "";
        let cleanedString = "";
        let folderPath = "";

        if (folderName1.trim() !== "") {
            cleanedString = folderName1
                .split("\n") 
                .map(line => line.trim().replace("> ", "")) 
                .filter(line => line !== "") 
                .join("/"); 
        }

        let successfulDeletions = 0;
        let failedDeletions = 0;

        TodeleteSelectedArray.forEach(subfolderName => {
            folderPath = cleanedString ? `${cleanedString}/${subfolderName}` : subfolderName;

            $.ajax({
                url: `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${libraryName}/${folderPath}')`,
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "DELETE"
                },
                success: function () {
                    successfulDeletions++;
                    if (successfulDeletions + failedDeletions === TodeleteSelectedArray.length) {
                        alert(`Deleted ${successfulDeletions} folders/files successfully.`);
                        location.reload(); 
                    }
                },
                error: function (error) {
                    failedDeletions++;
                    console.error('Error deleting folder:', error.responseText);
                    if (successfulDeletions + failedDeletions === TodeleteSelectedArray.length) {
                        alert(`Deleted ${successfulDeletions} folder/files successfully. Failed to delete ${failedDeletions} folders/files.`);
                        location.reload(); 
                    }
                }
            });
        });
    } else {
        alert('Please select at least one folder/files to delete.');
        return false;
    }
}

function uploadFilesToSubfolder() {
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;
    var libraryName = proLib; 
    var files = $('#fileInput')[0].files;

    var folderName1 = document.getElementById("ulProjDoc").innerText;
    var cleanedString = "";
    var folderPath = "";

    if (folderName1 && folderName1.trim() !== "") {
        cleanedString = folderName1
            .split("\n") 
            .map(line => line.trim().replace("> ", "")) 
            .filter(line => line !== "") 
            .join("/"); 
        folderPath = cleanedString; 
    }

    let uploadedFiles = 0;
    let failedFiles = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const arrayBuffer = e.target.result;

            $.ajax({
                url: `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${libraryName}/${folderPath}')/Files/Add(url='${file.name}', overwrite=true)`,
                type: "POST",
                data: arrayBuffer,
                processData: false,
                contentType: file.type,
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function () {
                    uploadedFiles++;
                    if (uploadedFiles + failedFiles === files.length) {
                        $('#result').text(`Uploaded: ${uploadedFiles}, Failed: ${failedFiles}`);
                        if (failedFiles === 0) {
                            alert('files uploaded successfully!');

                            setTimeout(function(){
                                location.reload();
                            }, 3000); 

                        }
                    }
                },
                error: function (error) {
                    failedFiles++;
                    if (uploadedFiles + failedFiles === files.length) {
                        $('#result').text(`Uploaded: ${uploadedFiles}, Failed: ${failedFiles}`);
                        if (uploadedFiles > 0) {
                            alert(`${uploadedFiles} file(s) uploaded successfully. ${failedFiles} file(s) failed.`);
                        } else {
                            alert('File upload failed for all files.');
                        }
                    }
                }
            });
        };

        reader.onerror = function () {
            failedFiles++;
            if (uploadedFiles + failedFiles === files.length) {
                $('#result').text(`Uploaded: ${uploadedFiles}, Failed: ${failedFiles}`);
                if (uploadedFiles > 0) {
                    alert(`${uploadedFiles} file(s) uploaded successfully. ${failedFiles} file(s) failed.`);
                } else {
                    alert('File upload failed for all files.');
                }
            }
        };

        reader.readAsArrayBuffer(file);
    }
}

var GetMasterColl;
function RoleMaster() {

var currentLoggedUserId = _spPageContextInfo.userId;

   var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('MatterManagement')/items?$select=*,MatterManager/Id,OtherTTAMember/Id&$expand=MatterManager,OtherTTAMember&$orderby=ID desc&$top=5000";

   var requestHeaders = { "accept": "application/json;odata=verbose" };
   $.ajax({
       url: requestUri,
       contentType: "application/json;odata=verbose",
       headers: requestHeaders,
       async: false,
       cache: false,
       success: function (data) {
           MatterManagementMasterColl= data.d.results;

           if(MatterManagementMasterColl.length>0){

           		for(var i=0;i<MatterManagementMasterColl.length;i++){

           		if(MatterManagementMasterColl[i].LibraryName==proLib1){

           		for(var j=0;j<MatterManagementMasterColl[i].MatterManager.results.length; j++){

           		if(MatterManagementMasterColl[i].MatterManager.results[j].Id==currentLoggedUserId  ){

           		 $('#anchrUploadProjectDocument').show();
                    $('#anchrUploadProjectDocument1').show();
                    $('#anchrUploadProjectDocument2').show();

           		}

           		}

           		}
           		}

           }

           if(MatterManagementMasterColl.length>0){

           		for(var i=0;i<MatterManagementMasterColl.length;i++){

           		 if(MatterManagementMasterColl[i].LibraryName==proLib1){

           		for(var j=0;j<MatterManagementMasterColl[i].OtherTTAMember.results.length; j++){

           		if(MatterManagementMasterColl[i].OtherTTAMember.results[j].Id==currentLoggedUserId  ){

           		$('#anchrUploadProjectDocument').show();
                   $('#anchrUploadProjectDocument1').show();
                   $('#anchrUploadProjectDocument2').show();

           		}

           		}

           		}
           		}

           }

           console.log(MatterManagementMasterColl)
       },
       error: function () {
           console.log("error");
       }
   });
}

function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
}

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function getListItems(listUrl) {
    var deferred = $.Deferred();
    $.ajax({
        url: listUrl,
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data) {
            deferred.resolve(data.d.results);
        },
        error: function (jqxr) {
            console.log("getListItems failure : " + jqxr.responseText);
            deferred.reject(jqxr);
        }
    });
    return deferred.promise();
}

function getFolders(docLibUrl) {
    $("#divLoading").show();
    var deferred = $.Deferred();
    $.ajax({
        url: docLibUrl,
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data) {
            $("#divLoading").hide();
            deferred.resolve(data.d);
            docLibFolders = data.d;
            $("#ulProjDoc").html("");
            bindFolderTblProjectDocument(data.d);
        },
        error: function (jqxr) {
            $("#divLoading").hide();
            console.log(jqxr.responseText);
            alert('The project does not have valid library to list the folders or files.');
            debugger
             location.href = 'https://sharepointistech.sharepoint.com/sites/TTAADMINHR/SitePages/TTA_MATTERMANAGEMENT/MatterManagement/TTA/MatterManagementLanding.aspx';
            deferred.reject(jqxr);
        }
    });
    return deferred.promise();
}

function bindFolderTblProjectDocument(projDocDetails) {
    if ($.fn.DataTable.isDataTable('#tblProjectDocuments')) {
        $('#tblProjectDocuments').dataTable().fnDestroy();
        $("#tblProjectDocuments thead tr").remove();
        $('#tblProjectDocuments thead').append(`<tr>
        <th class="tableHead" style="width: 12%;">Name</th>
               <th class="tableHead" style="width: 12%;">Created By</th>
        <th class="tableHead" style="width: 12%;">Created On</th>
    </tr>`);
    }
    var allProjDocDetailsHtml = "";
    projDocDetails.Folders.results.sort((a, b) => a.TimeCreated > b.TimeCreated ? 1 : -1);
    if (projDocDetails.Folders.results.length > 0 || projDocDetails.Files.results.length > 0) {
        for (var i = 0; i < projDocDetails.Folders.results.length; i++) {
            if (projDocDetails.Folders.results[i].Name != "Forms") {
                allProjDocDetailsHtml += "<tr>";
                allProjDocDetailsHtml += "<td style='width:5%;'><input type='checkbox' class='rowCheckbox' onclick='selectRow(this)'></td>";

                allProjDocDetailsHtml += "<td style='width:12%;'><a href='javascript:void(0);' onclick='getFiles(\"" + projDocDetails.Folders.results[i].ServerRelativeUrl + "\");'>" + projDocDetails.Folders.results[i].Name + "</a></td>";

                allProjDocDetailsHtml += "<td style='width:12%'>&nbsp;</td>";
                allProjDocDetailsHtml += "<td style='width:12%'>&nbsp;</td>";
                allProjDocDetailsHtml += "</tr>";
            }
            if (projDocDetails.Folders.results[i].Name == "Common Docs") {
                commonFolderColl = [];
                for (let o = 0; o < projDocDetails.Folders.results[i].Folders.results.length; o++) {
                    commonFolderColl.push(projDocDetails.Folders.results[i].Folders.results[o]);
                }
            }
        }
        for (var i = 0; i < projDocDetails.Files.results.length; i++) {
            var docType = "";
            if (projDocDetails.Files.results[i].ListItemAllFields.DocumentTypeId != undefined && projDocDetails.Files.results[i].ListItemAllFields.DocumentTypeId != null) {
                docType = $.grep(docTypeListItems, function (v) {
                    return v.Id === projDocDetails.Files.results[i].ListItemAllFields.DocumentTypeId;
                });
            }
            allProjDocDetailsHtml += "<tr>";
            allProjDocDetailsHtml += "<td style='width:5%;'><input type='checkbox' class='rowCheckbox' onclick='selectRow(this)'></td>";

            allProjDocDetailsHtml += "<td style='width:12%;'><a href='" + location.origin + projDocDetails.Files.results[i].ServerRelativeUrl + "' target='_blank'>" + projDocDetails.Files.results[i].Name + "</a></td>";

            allProjDocDetailsHtml += "<td style='width:12%'>" + (projDocDetails.Files.results[i].Author != undefined && projDocDetails.Files.results[i].Author != null ? projDocDetails.Files.results[i].Author.Title : '') + "</td>";
            allProjDocDetailsHtml += "<td style='width:12%'>" + (projDocDetails.Files.results[i].ListItemAllFields.Created != undefined && projDocDetails.Files.results[i].ListItemAllFields.Created != null ? new Date(projDocDetails.Files.results[i].ListItemAllFields.Created).toLocaleDateString('en-GB') : '') + "</td>";
            allProjDocDetailsHtml += "</tr>";
        }
    } else {
        allProjDocDetailsHtml += "<tr>";
        allProjDocDetailsHtml += "<td colspan = '6'>No data Found</td>";
        allProjDocDetailsHtml += "</tr>";
    }
    $("#tbodyProjectDocuments").html("");
    $("#tbodyProjectDocuments").html(allProjDocDetailsHtml);
}

function getFiles(folderUrl) {
    $("#divLoading").show();

    var docLibUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + folderUrl + "')?$expand=ListItemAllFields,Author,Folders,Files,Folders/ListItemAllFields,Files/ListItemAllFields,Files/Author&$top=5000";
    var deferred = $.Deferred();
    $.ajax({
        url: docLibUrl,
        async: false,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data) {
            $("#divLoading").hide();
            deferred.resolve(data.d);
            bindProjDocBreadCrums(folderUrl)
            bindFileTblProjectDocument(data.d);
        },
        error: function (jqxr) {
            $("#divLoading").hide();
            console.log(jqxr.responseText);
            deferred.reject(jqxr);
        }
    });
    return deferred.promise();
}

function bindProjDocBreadCrums(folderUrl) {
    var allProjDocBreadCrumsHtml = "";
    docLibLevel = proLib;
    var crumUrl = folderUrl.replace(_spPageContextInfo.webServerRelativeUrl + '/', "");

    for (let n = 1; n < crumUrl.split('/').length; n++) {
        docLibLevel += '/' + crumUrl.split('/')[n];
        allProjDocBreadCrumsHtml += "<li> > <a href='javascript:void(0)' onclick='getFiles(\"" + docLibLevel + "\");'>" + crumUrl.split('/')[n] + "</a>&nbsp;</li>"
    }

    $("#ulProjDoc").html("");
    $("#ulProjDoc").html(allProjDocBreadCrumsHtml);
}

function bindFileTblProjectDocument(projDocDetails) {
    if ($.fn.DataTable.isDataTable('#tblProjectDocuments')) {
        $('#tblProjectDocuments').DataTable().destroy();
        $("#tblProjectDocuments tbody").empty();
    }

    let allProjDocDetailsHtml = "";

    projDocDetails.Folders.results.sort((a, b) => a.TimeCreated > b.TimeCreated ? 1 : -1);
    projDocDetails.Files.results.sort((a, b) => a.Name > b.Name ? 1 : -1);

    for (let i = 0; i < projDocDetails.Folders.results.length; i++) {
        allProjDocDetailsHtml += "<tr>";
        allProjDocDetailsHtml += `<td><input type="checkbox" class="rowCheckbox" onclick="selectRow(this)"></td>`;
        allProjDocDetailsHtml += `<td><a href='javascript:void(0);' onclick='getFiles("${projDocDetails.Folders.results[i].ServerRelativeUrl}");'>${projDocDetails.Folders.results[i].Name}</a></td>`;
        allProjDocDetailsHtml += `<td>&nbsp;</td>`;
        allProjDocDetailsHtml += `<td>&nbsp;</td>`;
        allProjDocDetailsHtml += "</tr>";
    }

    for (let i = 0; i < projDocDetails.Files.results.length; i++) {
        allProjDocDetailsHtml += "<tr>";
        allProjDocDetailsHtml += `<td><input type="checkbox" class="rowCheckbox" onclick="selectRow(this)"></td>`;
        allProjDocDetailsHtml += `<td><a href="${location.origin + projDocDetails.Files.results[i].ServerRelativeUrl}" target="_blank">${projDocDetails.Files.results[i].Name}</a></td>`;
        allProjDocDetailsHtml += `<td>${projDocDetails.Files.results[i].Author ? projDocDetails.Files.results[i].Author.Title : ''}</td>`;
        allProjDocDetailsHtml += `<td>${projDocDetails.Files.results[i].ListItemAllFields.Created ? new Date(projDocDetails.Files.results[i].ListItemAllFields.Created).toLocaleDateString('en-GB') : ''}</td>`;
        allProjDocDetailsHtml += "</tr>";
    }

    if (projDocDetails.Folders.results.length === 0 && projDocDetails.Files.results.length === 0) {
        allProjDocDetailsHtml += `<tr><td colspan="4">No data found</td></tr>`;
    }

    $("#tbodyProjectDocuments").html(allProjDocDetailsHtml);

    $("#selectAll").prop("checked", false);
}

function toggleAllCheckboxes(selectAllCheckbox) {
    const allCheckboxes = $(".rowCheckbox");
    allCheckboxes.prop("checked", selectAllCheckbox.checked);
}

function bindDocumentType() {

    var deptItemColl = $.grep(deptListItems, function (item) {
        return (item.DeptUserId.results.indexOf(_spPageContextInfo.userId) > -1 && item.BusinessUnitId == bussUnitId);
    });
    userDept = deptItemColl[0];

    var docTypeColl = [];
    userDeptIds = [];

    for (var n = 0; n < deptItemColl.length; n++) {
        if (bussUnitId == deptItemColl[n].BusinessUnitId) {
            userDeptIds.push(deptItemColl[n].Id);
        }
        var docTypes = $.grep(docTypeListItems, function (item) {
            return item.DepartmentName.Title == deptItemColl[n].Title;
        });
        docTypeColl.push(...docTypes);
    }

    console.log(docTypeColl);

    var selectedDocTypeColl = [];
    if ($("#ddlFolders option:selected").text() != "Common Docs") {
        selectedDocTypeColl = $.grep(docTypeColl, function (item) {
            return item.DepartmentName.Title == $("#ddlFolders option:selected").text();
        });
    }
    else {
        var selSubFolder;
        if ($("#ddlSubFolders option:selected").text() == "Supply Chain") {
            selSubFolder = "SCM";
        }
        else if ($("#ddlSubFolders option:selected").text() == "Quality") {
            selSubFolder = "Quality";
        }
        else if ($("#ddlSubFolders option:selected").text() == "Commercial") {
            selSubFolder = "Commercial and Finance";
        }
        else if ($("#ddlSubFolders option:selected").text() == "Execution") {
            selSubFolder = "Operations";
        } else {
            selSubFolder = $("#ddlSubFolders option:selected").text();
        }

        selectedDocTypeColl = $.grep(docTypeColl, function (item) {
            return item.DepartmentName.Title == selSubFolder;
        });
    }

    $("#ddlDocType").html("");
    var allDocTypeHtml = "<option value=''>Select</option>";

    for (let i = 0; i < selectedDocTypeColl.length; i++) {
        allDocTypeHtml += "<option value='" + selectedDocTypeColl[i].Id + "'>" + selectedDocTypeColl[i].Title + "</option>"
    }
    $("#ddlDocType").html(allDocTypeHtml);

    bindSubFolders($("#ddlSubFolders").val());
}

function bindFolders() {
    $("#ddlFolders").html("");
    var allFoldersHtml = "<option value=''>Select</option>";

    for (let i = 0; i < docLibFolders.Folders.results.length; i++) {
        if (docLibFolders.Folders.results[i].Name != "Forms") {
            allFoldersHtml += "<option value='" + docLibFolders.Folders.results[i].ServerRelativeUrl + "'>" + docLibFolders.Folders.results[i].Name + "</option>"
        }
    }
    $("#ddlFolders").html(allFoldersHtml);
}

function bindSubFolders(selectedVal) {
    $("#ddlSubFolders").html("");
    var allSubFoldersHtml = "<option value=''>Select</option>";

    if ($("#ddlFolders option:selected").text() == "Common Docs") {
        $("#dvSubFolder").show();
        for (let i = 0; i < commonFolderColl.length; i++) {

            allSubFoldersHtml += "<option value='" + commonFolderColl[i].ServerRelativeUrl + "'>" + commonFolderColl[i].Name + "</option>"

        }
    }
    else {
        $("#dvSubFolder").hide();
    }
    $("#ddlSubFolders").html(allSubFoldersHtml);
    $("#ddlSubFolders").val(selectedVal);
}

function openUploadDoc() {
    var modal = document.getElementById("mdlProjDocs");
    modal.style.display = "block";

}

function closeUploadDoc() {
    var modal = document.getElementById("mdlProjDocs");
    modal.style.display = "none";
}

function openUploadDoc1() {
    var modal = document.getElementById("mdlProjDocs1");
    modal.style.display = "block";

}

function closeUploadDoc1() {
    var modal = document.getElementById("mdlProjDocs1");
    modal.style.display = "none";
}

function getFileBuffer(file) {
    var deferred = $.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(file);
    return deferred.promise();
}

function UploadDoc(fIndex) {

    var defFiles = $.Deferred();

    const files = document.getElementById("fileProjDoc").files;
    if (files.length > 0) {
        if (!$("#aspnetForm").valid()) {
            $("#btnUploadDoc").hide();
            return;
        }

        $("#btnUploadDoc").show();
        $("#divLoading").show();

        const file = files[fIndex];
        const fileName = file.name;
        const selectedFolder = $("#ddlSubFolders").val() || $("#ddlFolders").val();

        if (!selectedFolder) {
            console.error("Folder not selected.");
            $("#divLoading").hide();
            return;
        }

        getFileBuffer(file).done(function (arrayBuffer) {

            $.ajax({
                url: `${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${selectedFolder}')/files/add(overwrite=true, url='${fileName}')?$expand=ListItemAllFields`,
                type: "POST",
                data: arrayBuffer,
                processData: false,
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (docData) {
                    const projDocItem = {
                        __metadata: { type: docData.d.ListItemAllFields.__metadata.type }

                    };

                    $.ajax({
                        url: `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${proLib1}')/items(${docData.d.ListItemAllFields.Id})`,
                        type: "POST",
                        data: JSON.stringify(projDocItem),
                        headers: {
                            'X-RequestDigest': $("#__REQUESTDIGEST").val(),
                            'content-type': 'application/json;odata=verbose',
                            'accept': 'application/json;odata=verbose',
                            'IF-MATCH': '*',
                            'X-HTTP-Method': 'MERGE'
                        },
                        success: function () {

                            if (++fIndex < files.length) {
                                UploadDoc(fIndex);
                            } else {
                                getFiles(selectedFolder);
                                $("#divLoading").hide();
                                closeUploadDoc();
                                defFiles.resolve();
                            }
                        },
                        error: function (jqxr) {
                            console.error("Error updating metadata:", jqxr);
                            $("#divLoading").hide();
                            defFiles.reject(jqxr);
                        }
                    });
                },
                error: function (jqxr) {
                    console.error("Error uploading file:", jqxr);
                    $("#divLoading").hide();
                    defFiles.reject(jqxr);
                }
            });
        });
    }
    return defFiles.promise();
}