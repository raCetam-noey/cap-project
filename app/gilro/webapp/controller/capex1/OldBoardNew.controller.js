sap.ui.define([
   "sap/ui/core/mvc/Controller", 
    "sap/ui/model/json/JSONModel", 
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
     "../../control/modules",
    "sap/ui/core/Fragment",
    'sap/m/Link',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
	'sap/m/MessageToast'
    
],
   /**
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    */
   function (Controller, JSONModel, MessageBox, Filter, FilterOperator, modules, Fragment, Link, MessagePopover, MessageItem, MessageToast ) {
      "use strict";

      var oMessagePopover;
       
    return Controller.extend("gilro.controller.capex1.BoardNew", {
        onInit: function () {

           		// create any data and a model and set it to the view

			var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			var oMessageTemplate = new MessageItem({
				type: '{type}',
				title: '{title}',
				activeTitle: "{active}",
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				link: oLink
			});

			var sErrorDescription = 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
				'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
				'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
				'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
				'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
				'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

			oMessagePopover = new MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				},
				activeTitlePress: function () {
					MessageToast.show('Active title is pressed');
				}
			});

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				active: true,
				description: sErrorDescription,
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Warning',
				title: 'Warning without description',
				description: ''
			}, {
				type: 'Success',
				title: 'Success message',
				description: 'First Success message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Error',
				title: 'Error message',
				description: 'Second Error message description',
				subtitle: 'Example of subtitle',
				counter: 2
			}, {
				type: 'Information',
				title: 'Information message',
				description: 'First Information message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}];

			var oModel = new JSONModel();
			oModel.setData(aMockMessages);
			this.getView().setModel(oModel);
			this.byId("messagePopoverBtn").addDependent(oMessagePopover);
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverityIcon;
			var aMessages = this.getView().getModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverityIcon = "Negative";
						break;
					case "Warning":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
						break;
					case "Success":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ?  "Success" : sHighestSeverityIcon;
						break;
					default:
						sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
						break;
				}
			});

			return sHighestSeverityIcon;
		},

		// Display the number of messages with the highest severity
		highestSeverityMessages: function () {
			var sHighestSeverityIconType = this.buttonTypeFormatter();
			var sHighestSeverityMessageType;

			switch (sHighestSeverityIconType) {
				case "Negative":
					sHighestSeverityMessageType = "Error";
					break;
				case "Critical":
					sHighestSeverityMessageType = "Warning";
					break;
				case "Success":
					sHighestSeverityMessageType = "Success";
					break;
				default:
					sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
					break;
			}

			return this.getView().getModel().oData.reduce(function(iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0);
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			var sIcon;
			var aMessages = this.getView().getModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sIcon = "sap-icon://error";
						break;
					case "Warning":
						sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
						break;
					case "Success":
						sIcon = "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
						break;
					default:
						sIcon = !sIcon ? "sap-icon://information" : sIcon;
						break;
				}
			});

			return sIcon;
		},

		handleMessagePopoverPress: function (oEvent) {
			oMessagePopover.toggle(oEvent.getSource());
		},
    
       

          // cds Authors 데이터 
        _getAuthorsSelect : function(){
            let AuthorsPath = "/catalog/Authors"
			this._getData(AuthorsPath).then((AuthorsData) => {                                
                var oAuthorsModel = new JSONModel(AuthorsData.value)
                console.log(oAuthorsModel);
                this.getView().setModel(oAuthorsModel, "AuthorsSelect");
            })
            
        },

         // Author 다이얼로그 검색 버튼 
        // if문을 사용하여서 값이 없거나 undefined일때 데이터를 불러오고 그 이후로는 필터 기능을 수행한다 - by Mua
        onSearchAuthors : function(oEvent){
            let Mua = this.getView().byId("AuthorsSearch").getValue();
            if (Mua === undefined || Mua ==="") {
                this._getAuthorsSelect();
            } else {
            // add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("name", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

            // update list binding
			var oList = this.byId("AuthorsSelectTable");
			var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "name");
            console.log(oBinding);
          
            }
        },
        //작가명 필드 다이얼로그 이벤트
        handleTableSelectDialogPress: function () {
            var oAuthorsModel = new JSONModel()
            this.getView().setModel(oAuthorsModel, "AuthorsSelect");
            this.onAuthorsDialogOpen("AuthorsSelect")    

        },

        //작가명 다이얼로그 창 생성
        onAuthorsDialogOpen : function(){
            var oView = this.getView();

            if (!this.AuthorsDialog) {
				this.AuthorsDialog = Fragment.load({
					id: oView.getId(),
					name: "gilro.view.fragment.AuthorsSelect",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    // oDialog.attachBeforeOpen(function (oEvent) {
                    // }.bind(this));
					return oDialog;
				});
			} 
			this.AuthorsDialog.then(function(oDialog) {
                oDialog.open();
                oDialog.attachAfterOpen(function(){
                });
            });
        },
        //작가 다이얼로그 선택 값 가져오기
        onChaneSelect: function (oEvent){
             this.oText = oEvent.getParameters().listItem.getAggregation("cells")[1].getProperty("text")
        },

        //작가명 다이얼로그 선택 버튼
        onSelectAuthors: function (){
            this.getView().byId("P_author").setValue(this.oText)
            this.byId("AuthorsFrag").close();
        },

        //작가명 다이얼로그 창 닫기 버튼
        onCloseAuthorsFrag : function (){
            this.getView().byId("AuthorsFrag").close();

        },
          // 데이터 가져오기
        _getData: (Path) => {
            return new Promise((resolve) => {
                $.ajax({
                    type: "get",
                    async: false,
                    url: Path,
                    success: function (Data) {
                        resolve(Data)
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        alert(errorMessage)
                    },
                })
            })
        },
        //뒤로가기
        onBack: function () {
             this.getOwnerComponent().getRouter().navTo("BoardMain");
        }
    });
});
