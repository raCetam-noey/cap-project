sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
	"sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/thirdparty/jquery",
], function (JSONModel,Fragment, MessageBox, MessageToast, jquery) {
    "use strict";
    return  {
        // 로그
        log : function(message){
            console.log(" === "+message+" === ");
        },
        dir : function(message){
            console.dir(message);
        },
        d : function(msg1,msg2){
          console.log("┌**** "+msg1+" ****┐")
          console.dir(msg2)
          console.log("└********┘")
        },
        // 라우팅 
        routing : function(_this, url, param){
            this.log("routing");
            if(param === undefined){
                _this.getOwnerComponent().getRouter().navTo(url); 
            }else{
                _this.getOwnerComponent().getRouter().navTo(url,param); 
            }
        },
        refresh : function(_this,name){
            this.log(name+"table => refresh");
            // this.log( _this.byId(name));
            if(_this.byId(name).getBinding("items") !== undefined)
              _this.byId(name).getBinding("items").refresh();
        },
        // 데이터 조회
        select : function(url){
            this.log("select");
            return $.ajax({
                type: "get",
                url: url
              })
        },
        // 데이터 삭제
        delete : async function(url){
            this.log("modules delete");
            const resultData = await this.deleteReturn(url);
            return resultData;
        },
        deleteReturn : async function(url){
            let result = new JSONModel();
            await fetch(url, {
                    method: "DELETE",
                    headers: {
                     "Content-Type": "application/json;IEEE754Compatible=true",
                    },
                }).then((response) => {
                    result.state = "success";
                    result.data = response;
                }).catch((err) => {
                    result.state = "error";
                    result.data = err;
                });
            return result;
        },
        // 데이터 추가
        insert : async function(url, data){
            this.log("modules insert");
            this.dir(data);
            const resultData = await this.insertReturn(url, data);
            return resultData;
        },
        insertReturn :  async function(url, data){
            let result = new JSONModel();
            await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                  "Content-Type": "application/json;IEEE754Compatible=true",
                },
              }).then((response) => {
                    result.state = "success";
                    result.data = response;
                }).catch((err) => {
                    result.state = "error";
                    result.data = err;
                });
            return result;
        },
        // 데이터 수정
        update : async function(url, data){
            this.log("modules update");
            const resultData = await this.updateReturn(url, data);
            return resultData;
        },
        updateReturn :  async function(url, data){
            let result = new JSONModel();
            await fetch(url, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: {
                 "Content-Type": "application/json;IEEE754Compatible=true",
                },
              }).then((response) => {
                    result.state = "success";
                    result.data = response;
                }).catch((err) => {
                    result.state = "error";
                    result.data = err;
                });
            return result;
        },
        // 0붙이기
        addZero : function(number,max){
          const len = (number+"").length;
          // this.log(len);
          for(let i = 1; i < max-len; i++){
            number = "0"+number;
          }
          return number;
        },

        // 날짜 포멧
        formatter :  function(data){
          return  data.getFullYear()+"-"+this.addZero(data.getMonth() + 1,3)+"-"+this.addZero(data.getDate(),3);

        },
           // 날짜 포멧2
        formatter2 :  function(data){
          let date =  "20"+(data+"").replaceAll(". ","-").replaceAll(".","");
           this.log("점뺌 : "+date);
           return new Date(date);
        },
        //날짜에 점있나 확인하고 원래 포멧으로 변경해줌
        datecheck : function(data){
          //점있으면 트루를 반환
          return ((data+"").indexOf(".") != -1);
        },
        // 다이얼로그 생성
        createDialog : function(_this, name1, name2){
          this.log("createDialog");
          if (!_this.byId(""+name2)) {
            Fragment.load({
              id: _this.getView().getId(),
              name: name1 + name2,
              controller: _this
            }).then(function(oDialog){
              _this.getView().addDependent(oDialog);
              oDialog.open(oDialog);
            }.bind(_this));
          }
        },
        // 금액 , 찍어주기
        numberFormat : function(str){
          return (str+"").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        },
        // 금액 , 빼기
        numberFormat2 : function(str){
          return (str+"").replaceAll(",","");
        },
        
        // 코드 아이디로 코드 이름 반환
        codechange : async function(str){
          this.log("codechange");
          this.log(str);
          if(str == null || str == undefined){
            this.log("파라미터 널이거나 언디파인");
            return;
          }
            let data = await this.select("srv-api/ie/cd_002");
          let arr = data.value;
          for(let i in arr){
            if(i > 100 && arr[i].cd_002_id == str){
              return arr[i].code_name;
              break;
            }
          }
           this.log("데이터 널이거나 언디파인2");
            return;
          // let data = await this.select("srv-api/ie/cd_002?$filter=cd_002_id eq '"+str+"'");
          //  if(data == null || data == undefined){
          //   this.log("데이터 널이거나 언디파인");
          //   return;
          // }
          // this.dir(data.value);
          // return data.value[0].code_name;
        },

        //코드 이름으로 코드 아이디 반환
          codechange2 : async function(str){
          this.log("codechange");
          this.log(str);
          if(str == null || str == undefined){
            this.log("파라미터 널이거나 언디파인");
            return;
          }
          let data = await this.select("srv-api/ie/cd_002");
          let arr = data.value;
          for(let i in arr){
            if(i > 100 && arr[i].code_name == str){
              return arr[i].cd_002_id;
              break;
            }
          }
           this.log("데이터 널이거나 언디파인2");
            return;
          // this.dir(data.value);
          // return data.value[0].cd_002_id;
        },

         
        // 코드 아이디로 코드 이름 반환 수출
        codechange_ : async function(str){
          this.log("codechange_");
          this.log(str);
          if(str == null || str == undefined){
            this.log("파라미터 널이거나 언디파인");
            return;
          }
          let data = await this.select("srv-api/ie/cd_002?$filter=cd_002_id eq '"+str+"'");
           if(data == null || data == undefined){
            this.log("데이터 널이거나 언디파인2");
            return;
          }
          this.dir(data.value);
          return data.value[0].code_name;
        },


        //코드 이름으로 코드 아이디 반환 수출
          codechange2_ : async function(str){
          this.log("codechange2_");
          this.log(str);
          if(str == null || str == undefined){
            this.log("파라미터 널이거나 언디파인");
            return;
          }

       let data = await this.select("srv-api/ie/cd_002?$filter=code_name eq '"+str+"'");
           if(data == null || data == undefined){
            this.log("데이터 널이거나 언디파인2");
            return;
          }
          this.dir(data.value);
          return data.value[0].cd_002_id;
        }

      


    }
});