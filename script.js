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

      //Function that is called after successfull API call with a list of issues to show in the table
      var sortInfo = function(jira_data){
        var accountid = window.accountid;
        var accountname = window.accountname;
        console.log(accountid,accountname);
        $('#org-title').html(accountname+'  ('+accountid+')');
        for(var i=0;i<jira_data.total;i++){
          if(jira_data.issues[i].fields.customfield_13209 === null){
            var churnids = "";
          }else{
            var churnids = jira_data.issues[i].fields.customfield_13209;
          }
          if(churnids !== "" && churnids.includes(accountid)){
            $('#churnTable > tbody:last-child').append('<tr id="tr-'+jira_data.issues[i].key+'" class="table-warning"><th scope="row"><a target="_blank" href="https://falconio.atlassian.net/browse/'+jira_data.issues[i].key+'">'+jira_data.issues[i].key+'</a></th><td>'+jira_data.issues[i].fields.summary+'</td><td>'+jira_data.issues[i].fields.status.name+'</td><td><button data-mark=0 onclick="updateChurnRisk(\''+jira_data.issues[i].key+'\',\''+churnids+'\',\''+accountid+'\')" id="btn-'+jira_data.issues[i].key+'" type="button" class="btn btn-primary btn-sm">Remove risk</button></td></tr>');
          }else{
            $('#churnTable > tbody:last-child').append('<tr id="tr-'+jira_data.issues[i].key+'"><th scope="row"><a target="_blank" href="https://falconio.atlassian.net/browse/'+jira_data.issues[i].key+'">'+jira_data.issues[i].key+'</a></th><td>'+jira_data.issues[i].fields.summary+'</td><td>'+jira_data.issues[i].fields.status.name+'</td><td><button data-mark=1 onclick="updateChurnRisk(\''+jira_data.issues[i].key+'\',\''+churnids+'\',\''+accountid+'\')" id="btn-'+jira_data.issues[i].key+'" type="button" class="btn btn-warning btn-sm">Register risk</button></td></tr>');
          }
        }
        //Resize the actualy widget size, so the new content will fit in the view.
        API.resize();
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

  //Update the churn risk field with the AccountID or remove the AccountID from there depending on the action
  //Function outside of the widget, so it can be accessed by the client on button press. USE DOM to pass values.
  function updateChurnRisk(key,field,accountid){
    
    //TODO: LIMIT IT TO 3-5 risk maximum!
    console.log("-->Start updating...");
    var mark = $("#btn-"+key).data("mark");
    console.log(mark);
    var account = accountid;

    if(mark){
      console.log("It will be marked for churn...");
      field = field+account+', ';
      var sajt = {
        "fields" : {
            "customfield_13209" : field,
        }
      };
      console.log(JSON.stringify(sajt));
      //Field 13209 --> churn ids
      AP.request({
        url: '/rest/api/latest/issue/'+key,
        type: 'PUT',
        contentType: 'application/json',
        headers: {
          'Accept': 'application/json'
        },
        data: JSON.stringify(sajt),
        success: function(responseText){
          console.log("Successfully marked...");
          console.log(responseText);
          $('#tr-'+key).toggleClass("table-warning");
          $('#btn-'+key).toggleClass("btn-warning");
          $('#btn-'+key).toggleClass("btn-primary");
          $('#btn-'+key).html("Remove risk");
          $('#btn-'+key).data("mark", 0);
        },
        error: function(xhr, statusText, errorThrown){
          console.log(arguments);
        }
      });
    
    }else{
      console.log("Churn mark will be deleted...");
      field = field.replace(account+', ','');
      var sajt = {
        "fields" : {
            "customfield_13209" : field,
        }
      };
      console.log(JSON.stringify(sajt));
      AP.request({
        url: '/rest/api/2/issue/'+key,
        type: 'PUT',
        contentType: 'application/json',
        headers: {
          'Accept': 'application/json'
        },
        data: JSON.stringify(sajt),
        success: function(responseText){
          console.log("Successfully unmarked...");
          console.log(responseText);
          $('#tr-'+key).toggleClass("table-warning");
          $('#btn-'+key).toggleClass("btn-warning");
          $('#btn-'+key).toggleClass("btn-primary");
          $('#btn-'+key).html("Register risk");
          $('#btn-'+key).data("mark", 1);
        },
        error: function(xhr, statusText, errorThrown){
          console.log(arguments);
        }
      });
    }
  }