var gdata;
define("_ujgChurnRiskRegister", [ "jquery", "_ujgUtil" ], function($, util) {
    var ChurnRegisterGadget = function(API) {

      //Used to query URL parameters into a variable (e.g.: accountid)
      const getQueryParams = ( params, url ) => {
        let href = url;
        //this expression is to get the query strings
        let reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
        let queryString = reg.exec(href);
        return queryString ? queryString[1] : null;
      };

      var updateChurnRisk = function(mark,key){
        if(mark){

        }else{

        }
      };

      //Function that is called after successfull API call with a list of issues to show in the table
      var sortInfo = function(jira_data){
        var accountid = window.accountid;
        var accountname = window.accountname;
        console.log(accountid,accountname);
        $('#org-title').html(accountname);
        for(var i=0;i<jira_data.total;i++){
          var churnids = jira_data.issues[i].fields.customfield_13209;
          if(churnids !== null && churnids.includes(accountid)){
            $('#churnTable > tbody:last-child').append('<tr id="btn-'+jira_data.issues[i].key+'" class="table-warning"><th scope="row"><a target="_blank" href="https://falconio.atlassian.net/browse/'+jira_data.issues[i].key+'">'+jira_data.issues[i].key+'</a></th><td>'+jira_data.issues[i].fields.summary+'</td><td>'+jira_data.issues[i].fields.status.name+'</td><td><button id="btn-'+jira_data.issues[i].key+'" type="button" class="btn btn-primary btn-sm">Remove risk</button></td></tr>');
          }else{
            $('#churnTable > tbody:last-child').append('<tr id="btn-'+jira_data.issues[i].key+'"><th scope="row"><a target="_blank" href="https://falconio.atlassian.net/browse/'+jira_data.issues[i].key+'">'+jira_data.issues[i].key+'</a></th><td>'+jira_data.issues[i].fields.summary+'</td><td>'+jira_data.issues[i].fields.status.name+'</td><td><button id="btn-'+jira_data.issues[i].key+'" type="button" class="btn btn-warning btn-sm">Register risk</button></td></tr>');
          }
        }
      };


      //Funciton to request the list of related issues to the organization
      var callAPI = function(location) {
        //Field 13209 --> churn ids, Field 13124 --> account ids
        window.accountid = getQueryParams('accountid', location);
        window.accountname = getQueryParams('accountname', location);
        var url, jira_data; // initially are undefined
        url = "/rest/api/2/search?jql=" + encodeURIComponent("project = RDR AND (status != Closed AND status != Done) AND cf[13124] ~ " + accountid) + "&maxResults=100";
        // make a call for every issue with a maximum query of the previously calculated total #no issues
        // util.makeAjaxCall is an internal wrapper functions, please make Ajax call via AP.request for JIRA Cloud and $.ajax for JIRA Server
        util.makeAjaxCall({
        API: API,
        url: url,
        dataType: "json",
        success : function(jira_data) {
            console.log("Fetchin data success!");
            console.log(jira_data);
            sortInfo(jira_data);
        },
        error : function(jira_data) {
            //showError(url);
            alert("ERRORRRRRRRRR - " + url);
        }
        });
      };
      

      //AP is a JIRA global context CALLBACK function.
      //As the widget is loaded in an iFrame, we need to use this to get the parent URL for querying the original parameters.
      AP.getLocation(callAPI);

    };
    return ChurnRegisterGadget;
  });