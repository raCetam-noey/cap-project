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
    "sap/m/MessageToast",
    "sap/ui/richtexteditor/RichTextEditor"
    
],
   /**
    * @param {typeof sap.ui.core.mvc.Controller} Controller
    */
   function (Controller, JSONModel, MessageBox, Filter, FilterOperator, modules, Fragment, exportLibrary,
    Sorter, MessageToast, RichTextEditor) {
      "use strict";
        const EdmType = exportLibrary.EdmType;
        let _this;
        let _param;
        let _data;
      return Controller.extend("gilro.controller.capex1.BoardDetail", {
         onInit: function () {
                //페이지 갱신될 때 실행되는 함수 호출
                let Detail = this.getOwnerComponent().getRouter().getRoute("BoardDetail");
                let fullDetail = this.getOwnerComponent().getRouter().getRoute("BoardDetailFull");

                Detail.attachPatternMatched(this.onMyRoutePatternMatched, this);
                fullDetail.attachPatternMatched(this.onMyRoutePatternMatched2, this);

                //Rich Text Editor 을 VerticalLayout 에 추가하기 
                this.getView().byId("editor").addContent(this.oEditor.oRichTextEditor);

            },

            // 투컬럼 페이지 매칭 시 발동
            onMyRoutePatternMatched: function () {
                // this.byId("fullScreen").setVisible(true);
                // this.byId("exitScreen").setVisible(false);
            },

            // 풀스크린 페이지 매칭 시 발동
            onMyRoutePatternMatched2: function () {
                // this.byId("fullScreen").setVisible(false);
                // this.byId("exitScreen").setVisible(true);
            },

            // 스크린 확장
            onFull: function () {
                this.getOwnerComponent().getRouter().navTo("BoardDetail");
            },

            // 스크린 축소
            onExitFull: function () {
                this.getOwnerComponent().getRouter().navTo("BoardDetailFull");
            },

            // 돌아가기
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
            },
             //데이터 가져오기
            callData : async function(){
                modules.log("callData");
                let data = await modules.select("/catalog/Books/ID");
                let array = data.value;
                modules.dir(array);
                
                if(array.length === 0){
                    this.getView().setModel(new JSONModel(array), "delist");  
                    modules.log("품목 배열 하나도 없음");
                    return;
                    
                }
                modules.dir(data);
                console.log("detail");
                this.getView().setModel(new JSONModel(data), "detail");
               
            },

            // 데이터 조회
            select : function(url){
                modules.log("select");
                return $.ajax({
                    type: "get",
                    url: url
                    })
            },
            // Rich Text Editor 
            oEditor: {
            oRichTextEditor: new RichTextEditor("myRTE", {
                editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
                width: "100%",
                height: "600px",
                customToolbar: true,
                showGroupFont: true,
                showGroupLink: true,
                showGroupInsert: true,
                value: "",
                editable: false,
                ready: function () {
                    this.addButtonGroup("styleselect").addButtonGroup("table");
                }
            })
            
        },

      });
   });