sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
 
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, Export, ExportTypeCSV,) {
    "use strict";
    // var EdmType = exportLibrary.EdmType;

    return Controller.extend("fioriprojesi1.controller.main", {
      onInit: function () {
        this.getData();
      },

      cellClick: function () {
        getParameters().rowBindingContext.getPath();
      },
      getData: function () {
        var that = this;
        var onModel = new JSONModel();
        onModel.loadData(
          "/sap/opu/odata/sap/ZDAK_AFIS_YARATMA_SRV/zdak_afis_yaratSet"
        );
        onModel.attachRequestCompleted(function (oEvent) {
          if (oEvent.getParameter("success")) {
            var data = oEvent.getSource().getData().d.results;
            for (let i = 0; i < data.length; i++) {
              data[i].BaslTarih = that.unixToDate(data[i].BaslTarih);
              data[i].BitsTarih = that.unixToDate(data[i].BitsTarih);
            }
            var onModel1 = new JSONModel(data);
            that.getView().setModel(onModel1, "afis");
          }
        });
      },

      unixToDate: function (val) {
        if (val !== undefined && val !== "" && val !== null) {
          var unixDate = val.substr(6, 13);
          var date = new Date(parseInt(unixDate, 10));
          return date;
        }
      },

      // getData: function () {
      //   var that = this;
      //   var afisModel = new JSONModel();
      //   afisModel.loadData("/sap/opu/odata/sap/ZDAK_AFIS_YARATMA_SRV/zdak_afis_yaratSet");
      //   afisModel.attachRequestCompleted(function (oEvent) {
      //     if (oEvent.getParameter("success")) {
      //       var data = oEvent.getSource().getData().d.results;
      //       var aModel = new JSONModel(data);
      //       var aMode2l = new JSONModel(data);
      //       that.getView().setModel(aModel,"afis");
      //       that.getView().setModel(aMode2l,"afis2");
      //     }
      //   });
      // },

      handleOpen: function () {
        var that = this;
        if (!this.create) {
          this.create = sap.ui.xmlfragment("fioriprojesi1.view.create", that);
          this.getView().addDependent(this.create);
        }

        this.create.removeAllButtons();
        this.create.addButton(
          new sap.m.Button({
            text: "Kaydet",

            press: function () {
              var saveData = {
                AfisAdi: sap.ui.getCore().byId("name").getValue(),
                Aciklama: sap.ui.getCore().byId("info").getValue(),
                BaslTarih: sap.ui.getCore().byId("startyear").getDateValue(),
                BitsTarih: sap.ui.getCore().byId("endyear").getDateValue(),
              };
              saveData.BaslTarih.setHours(3, 0, 0, 0);
              saveData.BaslTarih =
                saveData.BaslTarih.toISOString().split(".")[0];
              saveData.BitsTarih.setHours(23, 59, 59, 59);
              saveData.BitsTarih =
                saveData.BitsTarih.toISOString().split(".")[0];

              var oModel1 = that.getOwnerComponent().getModel();

              oModel1.setUseBatch(true);
              oModel1.setHeaders({
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json",
                "X-CSRF-Token": "Fetch",
                DataServiceVersion: "2.0",
                Authorization: newData.Pernr,
              });

              oModel1.setTokenHandlingEnabled(true);
              var token = oModel1.getSecurityToken();
              oModel1.create("/zdak_afis_yaratSet", saveData, {
                method: "POST",
                header: "application/atom+xml;type=feed; charset=utf-8",
                "X-CSRF-Token": token,
                success: function () {
                  MessageToast.show("Afi?? Yarat??ld??");
                  that.getData();
                  that.create.close();
                  that.create.destroy();
                  that.create = null;
                },
                error: function () {
                  MessageToast.show("Kay??t ????lemi S??ras??nda Hata Olu??tu.");
                },
              });
            },
          })
        );

        this.create.addButton(
          new sap.m.Button({
            text: "Kapat",

            press: function () {
              that.create.close();

              that.create.destroy();

              that.create = null;
            },
          })
        );

        this.create.open();
      },

      onExport: function () {
        var excel_data = this.getView().getModel("afis").getData();
        for (let i = 0; i < excel_data.length; i++) {
          // excel_data[i].BasTarih =
          //   excel_data[i].BasTarih.toISOString().split("T")[0];
          // excel_data[i].BitTarih =
          //   excel_data[i].BitTarih.toISOString().split("T")[0];
          // excel_data[i].BasTarih.getDate() +
          //   "." +
          //   (excel_data[i].BasTarih.getMonth() + 1) +
          //   "." +
          //   excel_data[i].BasTarih.getFullYear();
          // excel_data[i].BitTarih =
          // excel_data[i].BitTarih.getDate() +
          // "." +
          // (excel_data[i].BitTarih.getMonth() + 1) +
          // "." +
          // excel_data[i].BitTarih.getFullYear();
        }
        var oModel = new JSONModel(excel_data);

        var oExport = new Export({
          exportType: new ExportTypeCSV({
            fileExtension: "csv",
            separatorChar: ",",
            charset: "utf-8",
          }),
          models: oModel,
          rows: { path: "/" },

          columns: [
            {
              name: "Afi?? ID",
              template: {
                content: "{AfisId}",
              },
            },
            {
              name: "Afi?? Ad??",
              template: {
                content: "{AfisAdi}",
              },
            },
            {
              name: "A????klama",
              template: {
                content: "{Aciklama}",
              },
            },
            {
              name: "Ba??lang???? Tarihi",
              template: {
                content: "{BaslTarih}",
              },
            },
            {
              name: "Biti?? Tarihi",
              template: {
                content: "{BitsTarih}",
              },
            },
          ],
        });
        oExport
          .saveFile("afi??_yaratma")
          .catch(function (oError) {
            MessageBox.error("Error when downloading data. ..." + oError);
          })
          .then(function () {
            oExport.destroy();
          });
      },

      // createColumnConfig: function () {
      //   return [
      //     {
      //       label: "Afi?? ID",
      //       property: "AfisId",
      //       type: EdmType.Number,
      //       scale: 0,
      //     },
      //     {
      //       label: "Afi?? Ad??",
      //       property: "AfisAdi",
      //       width: "25",
      //     },
      //     {
      //       label: "A????klama",
      //       property: "Aciklama",
      //       width: "25",
      //     },
      //     {
      //       label: "Ba??lang???? Tarihi",
      //       property: "BaslTarih",
      //       type: EdmType.Date,
      //       unitProperty: "Currency",
      //       width: "18",
      //     },
      //     {
      //       label: "Biti?? Tarihi",
      //       property: "BitsTarih",
      //       type: EdmType.Date,
      //     },
      //   ];
      // },

      // onExport: function () {
      //   var aCols, aProducts, oSettings, oSheet;

      //   aCols = this.createColumnConfig();
      //   aProducts = this.getView().getModel();

      //   oSettings = {
      //     workbook: { columns: aCols },
      //     dataSource: aProducts,
      //   };

      //   oSheet = new Spreadsheet(oSettings);
      //   oSheet
      //     .build()
      //     .then(function () {
      //       MessageToast.show("Spreadsheet export has finished");
      //     })
      //     .finally(oSheet.destroy);
      // },
    });
  }
);
