sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
	'sap/m/Link'
],
   /**
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    */
   function (Controller, RichTextEditor, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, Link ) {
        "use strict";
        var oMessagePopover;

      return Controller.extend("gilro.controller.capex1.BoardNew", {
         onInit: function () {
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
            
            //팝오버 에러 샘플 디테일 메세지
            var sErrorDescription = 'First Error message description. \n' +
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
                'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
                'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
                'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
                'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
                'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

            //메세지 팝오버 생성
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
                type: 'Success',
                title: '제목 입력 완료'
            }, {
                type: 'Warning',
                title: '저자를 제대로 입력해주세요',
                description: ''
            },{
                type: 'Warning',
                title: '재고를 제대로 입력해주세요',
                description: ''
            }, {
                type: 'Success',
                title: '줄거리 입력 완료',
               
            }];

            var oModel = new JSONModel();
            oModel.setData(aMockMessages);
            this.getView().setModel(oModel);
            this.byId("messagePopoverBtn").addDependent(oMessagePopover);
      
            },

            // 뒤로가기 (메인페이지로 이동)
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
            },
     
            // InputBox안에 ValueHelp 버튼 누르면 다이얼로그 창 생성
            handleTableSelectDialogPress: function () {
                var oAuthorModel = new JSONModel()
                this.getView().setModel(oAuthorModel, "AuthorsSelect");

                this.onAuthorDialogOpen("AuthorsSelect");
            },

            // Author 다이얼로그 오픈
            onAuthorDialogOpen: function () {
                var oView = this.getView();

                if(!this.AuthorsDialog) {
                    this.AuthorsDialog = Fragment.load({
                        id: oView.getId(),
                        name: "gilro.view.fragment.AuthorsSelect",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this.AuthorsDialog.then(function(oDialog) {
                    oDialog.open();

                    oDialog.attachAfterOpen(function(){

                    });
                });
            },

            // Dialog에서 Search Button 눌렀을 때 실행
            onSearchAuthors: function (oEvent) {
                let searchField = this.byId("AuthorsSearch").getValue();

                if (searchField === undefined || searchField === "") {
                    // 서치필드에 빈 값을 입력했을 때 전체 데이터가 나오게 함
                    this._getAuthorsSelect();
                } else {
                    // 서치필드에 입력한 값에 해당하는 데이터만 나오게 함
                    var aFilters = [];
                    var sQuery = oEvent.getSource().getValue();

                    if (sQuery && sQuery.length > 0) {
                        var filter = new Filter("name", FilterOperator.Contains, sQuery);
                        aFilters.push(filter);
                    }

                    // update list binding
                    var oTable = this.byId("AuthorsSelectTable");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter(aFilters);
                    // console.log(oBinding);
                }
            },

            // Authors 데이터 가져오기 
            _getAuthorsSelect: function () {
                let AuthorsPath = "/catalog/Authors"

                this._getData(AuthorsPath).then((oData) => {
                    var oAuthorsModel = new JSONModel(oData.value)
                    // console.log(oAuthorsModel);
                    this.getView().setModel(oAuthorsModel, "AuthorsSelect");
                })

            },

            // ajax를 사용하여 데이터 가져오기
            _getData: function (Path) {
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

            // 라디오 버튼 클릭 시 실행
            onChaneSelect: function (oEvent) {
                this.oText = oEvent.getParameters().listItem.getAggregation("cells")[1].getProperty("text");
                console.log(this.oText);
            },

            // Dialog의 선택 버튼 클릭 시, 추출한 값을 Input Box에 넣고 창 닫기
            onSelectAuthors: function () {
                this.getView().byId("author").setValue(this.oText);
                this.getView().byId("AuthorsFrag").close();
            },

            // Dialog의 취소 버튼 클릭 시 창 닫기
            onCloseAuthorsFrag: function () {
                this.getView().byId("AuthorsFrag").close();
            },

            onBarSave: function () {

            },

            onBarCancel: function () {
                
            },
            // Display the button type according to the message with the highest severity
            // The priority of the message types are as follows: Error > Warning > Success > Info
            buttonTypeFormatter: function () {
                var sHighestSeverityIcon;
                var aMessages = this.getView().getModel().oData;
                console.log(aMessages, "버튼타입");

                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sHighestSeverityIcon = "Critical";
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

            onSave: function() {
            
            var oButton = this.byId("messagePopoverBtn")
            oButton.setVisible(true);

            // 인풋 필드 Value Status
            var inputField1 = this.byId("title");
                if(!inputField1.getValue()){
                    inputField1.setValueState("Error");
                    inputField1.setValueStateText("제목을 입력해주세요.");
                    inputField1.focus(inputField1);
                } else {
                    inputField1.setValueState("None");
                    inputField1.setValueStateText("");
                }
                
            var inputField2 = this.byId("author");
                if(!inputField2.getValue()){
                    inputField2.setValueState("Error");
                    inputField2.setValueStateText("저자를 입력해주세요.");
                    inputField2.focus(inputField2);
                } else {
                    inputField2.setValueState("None");
                    inputField2.setValueStateText("");
                }

            var inputField3 = this.byId("stock");
                if(!inputField3.getValue()){
                    inputField3.setValueState("Error");
                    inputField3.setValueStateText("재고를 입력해주세요.");
                    inputField3.focus(inputField3);

                } else {
                    inputField3.setValueState("None");
                    inputField3.setValueStateText("");
                }
            }
   });
});