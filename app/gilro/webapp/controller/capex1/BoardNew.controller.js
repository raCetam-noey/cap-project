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
    'sap/m/Link',
    "sap/ui/core/ValueState",
    "sap/ui/model/Sorter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
],
   /**
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    */
   function (Controller, RichTextEditor, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, Link, ValueState, Sorter, BusyIndicator, MessageBox) {
        "use strict";
        var oMessagePopover;

      return Controller.extend("gilro.controller.capex1.BoardNew", {
         onInit: function () {

            this._getBooksSelect();

            this.inputField1 = this.byId("title");
            this.inputField2 = this.byId("author");
            this.inputField3 = this.byId("stock");
            this.inputField4 = this.byId("pFloat");

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
            
            onSave: function() {
            
            var oButton = this.byId("messagePopoverBtn")
            oButton.setVisible(true);

            // 인풋 필드 Value Status
                if(!this.inputField1.getValue()){
                    this.inputField1.setValueState("Error");
                    this.inputField1.setValueStateText("제목을 입력해주세요.");
                    this.inputField1.focus(this.inputField1);
                } else {
                    this.inputField1.setValueState("None");
                    this.inputField1.setValueStateText("");
                }
                
            
                if(!this.inputField2.getValue()){
                    this.inputField2.setValueState("Error");
                    this.inputField2.setValueStateText("저자를 입력해주세요.");
                    this.inputField2.focus(this.inputField2);
                } else {
                    this.inputField2.setValueState("None");
                    this.inputField2.setValueStateText("");
                }

            
                if(!this.inputField3.getValue()){
                    this.inputField3.setValueState("Error");
                    this.inputField3.setValueStateText("재고를 입력해주세요.");
                    this.inputField3.focus(this.inputField3);

                } else {
                    this.inputField3.setValueState("None");
                    this.inputField3.setValueStateText("");
                }

            },

            // 뒤로가기 (메인페이지로 이동)
            onBack: function () {
                var oButton = this.byId("messagePopoverBtn")
                MessageBox.confirm("돌아가시겠습니까? 작성한 데이터들은 저장되지 않습니다.", {
                    icon: MessageBox.Icon.CONFIRM,
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function(oAction) {
                        if (oAction === "OK") {
                            oButton.setVisible(false);
                            if (this.inputField1 !== undefined) {
                                this.inputField1.setValueState("None");
                                this.inputField1.setValue("");
                            }
                             if (this.inputField2 !== undefined) {
                                 this.inputField2.setValueState("None");
                                 this.inputField2.setValue("");
                            }
                              if (this.inputField3 !== undefined) {
                                  this.inputField3.setValueState("None");
                                  this.inputField3.setValue("");
                            }
                              if (this.inputField4 !== undefined) {
                                  console.log(this.inputField4);
                                  this.inputField4.setValue("");
                            }
                            console.log(this.inputField4);
                            this.getOwnerComponent().getRouter().navTo("BoardMain")
                        }
                    }.bind(this)

                })
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

              // cds Books 데이터 
            _getBooksSelect : function(){
                var that = this;
                let BooksPath = "/catalog/Books?$expand=author"
                this._getData(BooksPath).then((oBooksData) => {                                
                    var oBooksModel = new JSONModel(oBooksData.value)
                    console.log(oBooksModel);
                    this.getView().setModel(oBooksModel, "BooksSelect");

                    var oBooks = that.getView().getModel("BooksSelect").getProperty("/");
                    var bookID = Number(oBooks[oBooks.length-1]['ID'])+1;
                    console.log(bookID, "북아이디");
                    that.getView().byId("id").setValue(bookID);
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
            }
   });
});