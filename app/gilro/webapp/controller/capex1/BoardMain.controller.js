sap.ui.define([
    "gilro/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../../control/modules",
     'sap/ui/export/Spreadsheet',
     'sap/ui/export/library'
], function (Controller, Filter, FilterOperator, JSONModel, Fragment, Sorter, MessageBox, MessageToast, modules, Spreadsheet, exportLibrary) {
	"use strict";
    const EdmType = exportLibrary.EdmType;
	return Controller.extend("gilro.controller.capex1.BoardMain", {

        // 라이프 사이클
		onInit: function () {
            console.clear();
            console.log(" === BoardMain onInit === ");
            
        //검색 리스트 한번에 띄우기
        this.onSearch();
        
        // keep the reference to the OData model
        this.oDataModel = this.getOwnerComponent().getModel();        
                
        // 페이지 갱신될때 실행되는 함수 호출
        const myRoute = this.getOwnerComponent().getRouter().getRoute("BoardMain");
        myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);

        // 게시판 카운트
        const oConutModel = new JSONModel({ count: 0 });
        // 게시판 카운트에 쓰일 "co" 모델 생성
        this.getView().setModel(oConutModel, "co");

        // 테이블에 리스트 카운트 넣어주기
        let oBinding = this.byId("Table").getBinding("items");
            if (oBinding != undefined && oBinding.aIndices != undefined) {
            modules.dir("조회 리스트 갯수 : " + oBinding.aIndices.length);
            this.getView()
                .getModel("co")
                .setProperty("/count", oBinding.aIndices.length);
                console.log(oBinding.aIndices.length);
            } 
        },
        // 페이지 갱신시 발생하는 이벤트
        onMyRoutePatternMatched: async function () {
        // modules.log("onMyRoutePatternMatched");
        this._getBooksSelect();
        console.log("북 데이터 다시 불러오기");

        },

         // 작성 버튼 클릭
        onCreate: function() {
            this.getOwnerComponent().getRouter().navTo("BoardNew");
        
        },

        onBack: function() {
            this.getOwnerComponent().getRouter().navTo("Home");
        },

        // 상세 페이지 라우팅
        onroutepage: function (oEvent) {
            var poNum = oEvent.getSource().getCells()[0].getText();
            modules.log(poNum);
            this.getOwnerComponent().getRouter().navTo("BoardDetail", {
            num: poNum,
           
        });
        // 상세 페이지 이동시 메인 페이지 헤더 접기
        this.getView().byId("page").setHeaderExpanded(false);
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

        // 테이블 검색 버튼
        onSearch: function () {
            
            // 검색바 값 가져오기
            var searchFieldId     = this.getView().byId("P_id").getValue();
            var searchFieldAuthor = this.getView().byId("P_author").getValue();
            var searchFieldTitle  = this.getView().byId("P_title").getValue();
            // 값이 없으면 데이터 가져오기 ( 전체 검색 + 데이터 최초로 받아오기 )
            if(searchFieldId === "" && searchFieldAuthor === "" && searchFieldTitle === "" ) {
                this._getBooksSelect();

            } else {

                let idValue = this.byId("P_id").getValue();
                let authorValue = this.byId("P_author").getValue();
                let titleValue = this.byId("P_title").getValue();

                let oTable = this.byId("Table");

                // 검색바 입력에 맞는 조건을을 넣을 배열
                let aTableSearchState = [];

                // 검색바 역할에 맞게 각 검색바 마다 필터 조건 넣기
                let aIdFilter = [new Filter({path: "ID", operator: FilterOperator.Contains, value1: idValue, caseSensitive: false})]; 
                let aAuthorFilter = [new Filter({path: "author/name", operator: FilterOperator.Contains, value1: authorValue, caseSensitive: false})]; 
                let aTitleFilter = [new Filter({path: "title", operator: FilterOperator.Contains, value1: titleValue, caseSensitive: false})]; 
            
                //각각 검색바에 검색 및 여러 개의 검색바에 검색값을 입력 했을시 내용 넣어주기
                aTableSearchState.push(new Filter({filters: aIdFilter}));
                aTableSearchState.push(new Filter({filters: aAuthorFilter}));
                aTableSearchState.push(new Filter({filters: aTitleFilter}));

                oTable.getBinding("items").filter(aTableSearchState);

            }

            //테이블 갯수 카운트해서 JSON에 넣기
            let oBinding = this.byId("Table").getBinding("items");

            if (oBinding != undefined && oBinding.aIndices != undefined) {
            this.getView().getModel("co").setProperty("/count", oBinding.aIndices.length);
            }
        },
        //테이블 검색 버튼 초기화
        onPressReset : function(){
            this.byId("P_id").setValue("");
            this.byId("P_author").setValue("");
            this.byId("P_title").setValue("");
        },

        //필터 버튼 입력시 다이얼로그 이벤트
        onSetFilter : function () {
            this.onNewCmsOpenSettings();
        },

        //필터 버튼 다이얼로그 창 생성
        onNewCmsOpenSettings : function () {
            const sDialogTab = "filter";
            
            if (!this.byId("filter")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "gilro.view.fragment.Filter",
                    controller: this
                }).then(function(oDialog){
                    this.getView().addDependent(oDialog);
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("filter").open(sDialogTab);
            }
        },

        //테이블 필터 기능 
        onConfirmOrderDialog : function (oEvent) {
            let mParams = oEvent.getParameters();
            console.log(mParams);
            let sPath = mParams.sortItem.getKey();
            let bDescending = mParams.sortDescending;

            let aSorters = [];
            aSorters.push(new Sorter(sPath, bDescending));

            let oBinding = this.byId("Table").getBinding("items");
            this.getView().getModel("co").setProperty("/count", oBinding.aIndices.length);
            oBinding.sort(aSorters);
			this.groupReset =  true;
		
			let aFilters = [];
	
			mParams.filterItems.forEach(function(oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = null,
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
					console.log(oFilter);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);
			console.log(oBinding.filter)
			console.log(oBinding);
			// update filter bar
			this.byId("FilterBar").setVisible(aFilters.length > 0);
			this.byId("FilterLabel").setText(mParams.filterString);

		
			if (oBinding != undefined && oBinding.aIndices != undefined) {
				modules.dir("조회 리스트 갯수 : " + oBinding.aIndices.length);
				this.getView()
				.getModel("co")
				.setProperty("/count", oBinding.aIndices.length);
            }
               
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

         // cds Books 데이터 
        _getBooksSelect : function(){
            let BooksPath = "/catalog/Books?$expand=author"
			this._getData(BooksPath).then((oBooksData) => {                                
                var oBooksModel = new JSONModel(oBooksData.value)
                console.log(oBooksModel);
                this.getView().setModel(oBooksModel, "BooksSelect");
                  // 테이블에 리스트 카운트 넣어주기
                let oBinding = this.byId("Table").getBinding("items");
                    if (oBinding != undefined && oBinding.aIndices != undefined) {
                    modules.dir("조회 리스트 갯수 : " + oBinding.aIndices.length);
                    this.getView()
                        .getModel("co")
                        .setProperty("/count", oBinding.aIndices.length);
                        console.log(oBinding.aIndices.length);
                    } 
            })
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

        //작가명 필드 다이얼로그 이벤트
        handleTableSelectDialogPress: function (oEvent) {
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
        //엑셀 파일 생성
        onDataExport: function () {
	      modules.log("onDataExport");
          console.log(this.byId("Table").getBinding("items"));
          if(this.byId("Table").getBinding("items") === undefined){
            MessageBox.alert("리스트를 먼저 조회해주세요.");
            return;
          }

          let aCols, oRowBinding, oSettings, oSheet, oTable;
   
          if (!this._oTable) {
            this._oTable = this.byId('Table');
          }

          oTable = this._oTable;
          oRowBinding = oTable.getBinding('items');
          aCols = this.createColumnConfig();

          oSettings = {
            workbook: {
              columns: aCols,
              hierarchyLevel: 'Level'
            },
            dataSource: oRowBinding,
            fileName: '도서목록.xlsx',
            worker: false 
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function() {
            oSheet.destroy();
          });
        },
      
        createColumnConfig: function() {
        const aCols = [];

        aCols.push({
          property: 'ID',
          type: EdmType.String
        });

        aCols.push({
          property: 'name',
          type: EdmType.String
        });

        aCols.push({
          property: 'author_ID',
          type: EdmType.String
        });

        aCols.push({
          property: 'stock',
          type: EdmType.String
        });

        aCols.push({
          property: 'title',
          type: EdmType.String
        });

        return aCols;
      },

	});
});