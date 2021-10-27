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
    "sap/ui/core/ValueState",
    "sap/ui/model/Sorter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, RichTextEditor, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, ValueState, Sorter, BusyIndicator, MessageBox) {
        "use strict";
        var oMessagePopover;
        var bookSeq;
        var bookList = [];
        return Controller.extend("gilro.controller.capex1.BoardNew", {
            //책 내용들 밀어주기
            Books: {
            },

            onInit: function (oEvent) {


                this._getBooksSelect();




                // 유효성 검사에 필요한 값들의 전역변수
                this.id = this.byId("id");
                this.title = this.byId("title");
                this.author = this.byId("author");
                this.stock = this.byId("stock");
                this.ploat = this.byId("ploat");


                var oMessageTemplate = new MessageItem({
                    type: '{type}',
                    title: '{title}',
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
                }, {
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

            onSave: function () {

                var oButton = this.byId("messagePopoverBtn")
                oButton.setVisible(true);

                // 인풋 필드 Value Status
                if (!this.title.getValue()) {
                    this.title.setValueState("Error");
                    this.title.setValueStateText("제목을 입력해주세요.");
                    this.title.focus(this.title);
                } else {
                    this.title.setValueState("None");
                    this.title.setValueStateText("");
                }


                if (!this.author.getValue()) {
                    this.author.setValueState("Error");
                    this.author.setValueStateText("저자를 입력해주세요.");
                    this.author.focus(this.author);
                } else {
                    this.author.setValueState("None");
                    this.author.setValueStateText("");
                }


                if (!this.stock.getValue()) {
                    this.stock.setValueState("Error");
                    this.stock.setValueStateText("재고를 입력해주세요.");
                    this.stock.focus(this.stock);

                } else {
                    this.stock.setValueState("None");
                    this.stock.setValueStateText("");
                }



                //데이터 생성을 위해 필요한 값들의 전역 변수 
                this.Books.ID = this.byId("id").getValue();

                this.Books.title = this.byId("title").getValue();

                this.Books.author = this.byId("author").getValue();

                this.Books.stock = this.byId("stock").getValue();

                this.Books.ploat = this.byId("ploat").getProperty("value");

                this.InsertBooks = this.Books;

                console.log(this.InsertBooks, "입력된 내용들");

                // var BooksData = this.InsertBooks

                // 새롭게 들어가질 데이터들 형식 => 잘 안맞으면 400에러 발생
                var BooksData = {
                    "ID": this.Books.ID,
                    "title": this.Books.title,
                    "author_ID": this.oID,
                    "stock": this.Books.stock,
                    "ploat": this.Books.ploat
                };
                console.log(BooksData);
                // 데이터 넣어주기
                this._insertData(BooksData);
            },
            // 새로운 데이터 등록해주기
            _insertData: function (BooksData) {
                MessageBox.confirm("등록하시겠습니까?", {
                    icon: MessageBox.Icon.CONFIRM,
                    title: "도서 등록",
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            var serverPath = "/catalog/Books"
                            fetch(`${serverPath}`, {
                                method: "POST",
                                body: JSON.stringify(BooksData),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }).then((response) => {
                                if (!response.ok) {
                                    throw new Error(`${response.status} - ${response.statusText}`)
                                }
                                return response.json();
                            })
                                .then(() => {
                                    if (bookList.length > 0) {
                                        this.onStartUpload(this.InsertBooks);
                                    }
                                    this.getOwnerComponent().getRouter().navTo("BoardMain");

                                })
                                .then((decodedResponse) => {
                                    console.log("등록이 되었습니다.");
                                    console.log("decodedResponse", decodedResponse)
                                    sap.ui.getCore().getMessageManager().removeAllMessages();
                                    this.getOwnerComponent().getRouter().navTo("BoardMain")
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        }
                    }.bind(this)
                })
            },

            // 뒤로가기 (메인페이지로 이동)
            onBack: function () {
                var oButton = this.byId("messagePopoverBtn")
                MessageBox.confirm("돌아가시겠습니까? 작성한 데이터들은 저장되지 않습니다.", {
                    icon: MessageBox.Icon.CONFIRM,
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            oButton.setVisible(false);
                            if (this.title !== undefined) {
                                this.title.setValueState("None");
                                this.title.setValue("");
                            }
                            if (this.author !== undefined) {
                                this.author.setValueState("None");
                                this.author.setValue("");
                            }
                            if (this.stock !== undefined) {
                                this.stock.setValueState("None");
                                this.stock.setValue("");
                            }
                            if (this.ploat !== undefined) {
                                console.log(this.ploat);
                                this.ploat.setValue("");
                            }
                            console.log(this.ploat);
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

                if (!this.AuthorsDialog) {
                    this.AuthorsDialog = Fragment.load({
                        id: oView.getId(),
                        name: "gilro.view.fragment.AuthorsSelect",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this.AuthorsDialog.then(function (oDialog) {
                    oDialog.open();

                    oDialog.attachAfterOpen(function () {

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
            _getBooksSelect: function () {
                var that = this;
                let BooksPath = "/catalog/Books?$expand=author"
                this._getData(BooksPath).then((oBooksData) => {
                    var oBooksModel = new JSONModel(oBooksData.value)

                    this.getView().setModel(oBooksModel, "BooksSelect");
                    console.log(oBooksModel.oData, "BooksSelect");
                    var oBooks = that.getView().getModel("BooksSelect").getProperty("/");
                    this.bookID = Number(oBooks[oBooks.length - 1]['ID']) + 1;
                    console.log(this.bookID, "북아이디");
                    that.getView().byId("id").setValue(this.bookID);
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
                this.oID = oEvent.getParameters().listItem.getAggregation("cells")[0].getProperty("text");
                console.log(this.oText);
                console.log(this.oID);
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
                            sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ? "Success" : sHighestSeverityIcon;
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

                return this.getView().getModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
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