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
                 modules.routing(this,"BoardDetailFull",{num: _param})
            },

            // 스크린 축소
            onExitFull: function () {
                 modules.routing(this,"BoardDetail",{num: _param})
            },

            // 돌아가기
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
                
            },
            onEdit: function() {
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
                    onClose: function(oAction) {
                        if (oAction === "OK") {
                            if(!this.edit.getProperty("/editMode")) {
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
             //데이터 가져오기
            selectList : async function(){
                // modules.log("selectList");
                //select 라는 함수를 호출해서 매개변수로 해서 string의 값으로 넣는다
                
                let list = await this.select("/catalog/Books?$expand=author");
                modules.dir(list, "list");
                console.log(list.value);
                let oArray = list.value;
                let data;
                for(let i in oArray){
                    if(oArray[i].ID === _param){
                        data = oArray[i];
                    }
                }
                modules.dir(data, "data");
                console.log(_param);
                
                this.getView().setModel(new JSONModel(data), "Detail");
                this.getView().getModel("Detail").refresh(true);
            },

            // 데이터 조회
            select : function(url){
                // modules.log("select");
                return $.ajax({
                    type: "get",
                    url: url
                    })
            },


      });
   });