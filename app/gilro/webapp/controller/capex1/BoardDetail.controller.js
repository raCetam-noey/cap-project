sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../../control/modules",
    "sap/ui/core/Fragment",
    'sap/ui/export/library',
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Filter, FilterOperator, modules, Fragment, exportLibrary,
        Sorter, MessageToast) {
        "use strict";
        const EdmType = exportLibrary.EdmType;
        let _this;
        let _param;
        let _data;
        return Controller.extend("gilro.controller.capex1.BoardDetail", {
             //책 내용들 밀어주기
            Books: {
            },
            onInit: function () {

                

                //editMode
                let oEditModel = new JSONModel({
                    editMode: true
                })
                this.getView().setModel(oEditModel, "editModeSwitch")
                
                
                //페이지 갱신될 때 실행되는 함수 호출
                let Detail = this.getOwnerComponent().getRouter().getRoute("BoardDetail");
                let fullDetail = this.getOwnerComponent().getRouter().getRoute("BoardDetailFull");

                Detail.attachPatternMatched(this.onMyRoutePatternMatched, this);
                fullDetail.attachPatternMatched(this.onMyRoutePatternMatched2, this);

                //Rich Text Editor 을 VerticalLayout 에 추가하기 
                // this.getView().byId("editor").addContent(this.oEditor.oRichTextEditor);

            },

            // 투컬럼 페이지 매칭 시 발동
            onMyRoutePatternMatched: function (e) {
                this.byId("fullScreen").setVisible(true);
                this.byId("exitScreen").setVisible(false);
                _data = this.getView().getModel("BoardDetail");
                _this = this;
                _param = e.getParameter("arguments").num;
                this.selectList();
                this.param = _param;
                console.log(this.param, "전역변수 param");
            },

            // 풀스크린 페이지 매칭 시 발동
            onMyRoutePatternMatched2: function (e) {
                this.byId("fullScreen").setVisible(false);
                this.byId("exitScreen").setVisible(true);
                _data = this.getView().getModel("BoardDetail");
                _this = this;
                _param = e.getParameter("arguments").num;
                this.selectList();
            },

            // 스크린 확장
            onFull: function () {
                modules.routing(this, "BoardDetailFull", { num: _param })
            },

            // 스크린 축소
            onExitFull: function () {
                modules.routing(this, "BoardDetail", { num: _param })
            },

            // 돌아가기
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");

            },
            onEdit: function () {
                this.edit = this.getView().getModel("editModeSwitch")
                if (this.edit.getProperty("/editMode")) {
                    this.edit.setProperty("/editMode", false)
                    this.byId("pFloat").setEditable(true);
                }
                this.byId("editButton").setVisible(false);
                this.byId("deleteButton").setVisible(false);
                this.byId("saveButton").setVisible(true);
                this.byId("cancelButton").setVisible(true);

            },

            onCancel: function (oEvent) {
                MessageBox.confirm("돌아가시겠습니까? 작성한 데이터들은 저장되지 않습니다.", {
                    icon: MessageBox.Icon.CONFIRM,
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            if (!this.edit.getProperty("/editMode")) {
                                this.edit.setProperty("/editMode", true)
                                this.byId("pFloat").setEditable(false);
                            }
                            this.byId("editButton").setVisible(true);
                            this.byId("deleteButton").setVisible(true);
                            this.byId("saveButton").setVisible(false);
                            this.byId("cancelButton").setVisible(false);
                            this.getOwnerComponent().getRouter().navTo("BoardMain")
                        }
                    }.bind(this)


                })
            },

            //저장시 데이터 업데이트
            onSave: function (){
                MessageBox.confirm("수정 사항을 저장하시겠습니까?",{
                      icon: MessageBox.Icon.CONFIRM,
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                //데이터 생성을 위해 필요한 값들의 전역 변수 
                this.Books.title = this.byId("NewTitle").getValue();
                this.Books.stock = this.byId("NewStock").getValue();
                this.Books.ploat = this.byId("pFloat").getProperty("value");
                this.InsertBooks = this.Books;
                console.log(this.InsertBooks, "입력된 내용들");                
                // 새롭게 들어가질 데이터들 형식 => 잘 안맞으면 400에러 발생
                var BooksData = {
                    "ID": this.param,
                    "title": this.Books.title,
                    "author_ID": this.oID,
                    "stock": this.Books.stock,
                    "ploat": this.Books.ploat
                };
                   if (!this.edit.getProperty("/editMode")) {
                        this.edit.setProperty("/editMode", true)
                        this.byId("pFloat").setEditable(false);
                        }
                        this.byId("editButton").setVisible(true);
                        this.byId("deleteButton").setVisible(true);
                        this.byId("saveButton").setVisible(false);
                        this.byId("cancelButton").setVisible(false);
                console.log(BooksData);
                this.onCmsBoardUpdate(BooksData);    
                        }
                    }.bind(this)
                })
            },
            //삭제버튼
               onDelete: function () {
                var that = this;
                MessageBox.confirm("정말로 삭제 하시겠습니까?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                        that.onCmsBoardDelete();
                        }
                    }
                })
            },

            // 게시글 수정한 부분 업데이트 함수
            onCmsBoardUpdate: async function ( cmsUpdateData) {
                const cmsUpdate = "/catalog/Books/"+ this.param +"";
                fetch(cmsUpdate, {
                    method: "PATCH",
                    body: JSON.stringify(cmsUpdateData),
                    headers: {
                        "Content-Type": "application/json;IEEE754Compatible=true"
                    },
                }).then((response) => {
                    MessageToast.show("게시글 수정 완료");
                    this.selectList();
                }).catch((err) => {
                    alert(err);
                });
            },

            //게시글 삭제 버튼 클릭시 실행될 함수
            onCmsBoardDelete : async function(){
                // let cmsData3 = this.getView().getModel("detalData");

                const cmsDelete = "/catalog/Books/"+ this.param +"";
                fetch(cmsDelete, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json;IEEE754Compatible=true",
                },
                }).then((response) => {
                    console.log("response");
                    MessageToast.show("게시글 삭제 완료");
                    this.getOwnerComponent().getRouter().navTo("BoardMain");
                }).catch((err) => {
                    alert(err);
                });
            },


             //데이터 가져오기
            selectList: async function () {
                // modules.log("selectList");
                //select 라는 함수를 호출해서 매개변수로 해서 string의 값으로 넣는다

                let list = await this.select("/catalog/Books?$expand=author");
                modules.dir(list, "list");
                console.log(list.value);
                let oArray = list.value;
                let data;
                for (let i in oArray) {
                    if (oArray[i].ID === _param) {
                        data = oArray[i];
                    }
                }
                modules.dir(data, "data");
                console.log(_param);

                this.getView().setModel(new JSONModel(data), "Detail");
                this.getView().getModel("Detail").refresh(true);
            },

            // 데이터 조회
            select: function (url) {
                // modules.log("select");
                return $.ajax({
                    type: "get",
                    url: url
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


            // 라디오 버튼 클릭 시 실행
            onChaneSelect: function (oEvent) {
                this.oText = oEvent.getParameters().listItem.getAggregation("cells")[1].getProperty("text");
                this.oID = oEvent.getParameters().listItem.getAggregation("cells")[0].getProperty("text");
                console.log(this.oText);
                console.log(this.oID);
            },

            // Dialog의 선택 버튼 클릭 시, 추출한 값을 Input Box에 넣고 창 닫기
            onSelectAuthors: function () {
                this.getView().byId("NewAuthorName").setValue(this.oText);
                this.getView().byId("NewAuthorID").setValue(this.oID);
                this.getView().byId("AuthorsFrag").close();
            },

            // Dialog의 취소 버튼 클릭 시 창 닫기
            onCloseAuthorsFrag: function () {
                this.getView().byId("AuthorsFrag").close();
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
        });
    });