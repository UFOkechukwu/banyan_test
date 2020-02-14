

var main_view = new Vue({
    el: '#bd_main_view_vue',
    data: {
        self: {},
        data_array: [],
        avg_month_et_loc: [],
        data_sources: [],
        new_source: { name: "", color: "#", url: "http://", is_default: false },
        mode: "new",
        client: new HttpClient(),
        show_loader: false
    },
    mounted() {
        self = this;
        self.init();
    },
    methods: {
        init() {
            $('.modal').modal();
            self.loadView();
        },
        loadView() {

            self.data_sources = getGetDataSources();
            self.data_array = [];


            var counter = 0;
            self.show_loader = true;
            for (var d_source of self.data_sources) {
                self.client.get(d_source, function (response, data, status) {
                    counter = counter + 1;

                    if (status == 200) {
                        var json_data = self.getTableJSONData(response);
                        //get averages
                        var et_avg = self.averageEtByLocation(json_data);
                        //set color
                        et_avg.color = data.color;
                        //set name
                        et_avg.name = data.name;
                        //store averages...
                        self.data_array.push(et_avg);
                    }

                    self.setUpCharts(self.data_array);
                    if (self.data_sources.length == counter) {
                        //self.setUpCharts(self.data_array);
                        self.show_loader = false;

                    }

                });

            }

        },
        getTableJSONData(html_string) {
            let doc = new DOMParser().parseFromString(html_string, 'text/html');
            let table = doc.getElementsByTagName("table")[0];

            var data = [];
            for (var i = 1; i < table.rows.length; i++) {
                var tableRow = table.rows[i];
                var rowData = [];
                for (var j = 0; j < tableRow.cells.length; j++) {
                    rowData.push(tableRow.cells[j].innerHTML);
                }
                data.push(rowData);
            }

            var response_data = [];
            for (var entry of data) {
                if (entry.length === 9) {
                    var item = {};
                    item.date = entry[0];
                    item.et = entry[1];
                    item.rain = entry[2];
                    item.temp_high = entry[3];
                    item.temp_avg = entry[4];
                    item.temp_low = entry[5];
                    item.humidity_avg = entry[6];
                    item.wind_avg = entry[7];
                    item.solar_avg = entry[8];

                    response_data.push(item);
                }
            }

            return response_data;
        },
        averageEtByLocation(loc_data) {
            total_et_monthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            total_et_days = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for (var entry of loc_data) {
                //split date string take month value 
                month = parseInt(entry.date.split("/")[0]);
                total_et_monthly[month - 1] = total_et_monthly[month - 1] + parseFloat(entry.et);
                total_et_days[month - 1] = total_et_days[month - 1] + 1;
            }

            result = {};
            for (var i = 0; i < total_et_days.length; i++) {
                total_et_monthly[i] = total_et_monthly[i] / total_et_days[i];
                if (i == 0 || (i > 0 && total_et_monthly[i] > result.avg_high)) {
                    result.avg_high = total_et_monthly[i];
                    result.month = i;   //0
                }
            }
            result.avg_et = total_et_monthly;

            // result.january = total_et_monthly[0];
            // result.feburary = total_et_monthly[1];
            // result.march = total_et_monthly[2];
            // result.april = total_et_monthly[3];
            // result.may = total_et_monthly[4];
            // result.june = total_et_monthly[5];
            // result.july = total_et_monthly[6];
            // result.august = total_et_monthly[7];
            // result.september = total_et_monthly[8];
            // result.october = total_et_monthly[9];
            // result.november = total_et_monthly[10];
            // result.december = total_et_monthly[11];

            return result;
        },
        setUpCharts(data_array) {

            m_labels = [];
            m_data = [];
            m_colors = [];

            //Not certain about question requirements
            // for (var d of data_array) {
            //     m_labels.push(d.name);
            //     m_data.push(d.avg_high);
            //     m_colors.push(d.color);
            // }

            m_labels = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            //Not certain about question requirements
            // for(var i = 0; i < data_array.length; i++){
            //     if(i==0){
            //         for(var m1 = 0; m1<12; m1++){
            //             m_data[m1] = data_array[i].avg_et[m1];
            //             m_colors[m1] = data_array[i].color;
            //         }
            //     }else{
            //         for(var m2 = 0; m2<12; m2++){
            //             if(m_data[m2] < data_array[i].avg_et[m2]){
            //                 m_data[m2] = data_array[i].avg_et[m2];
            //                 m_colors[m2] = data_array[i].color;
            //             }
            //         }

            //     }

            // }


            var _data_set = [];
            for (var data of data_array) {
                var _set = {
                    label: data.name,
                    backgroundColor: data.color,
                    borderWidth: 1,
                    data: data.avg_et
                };
                _data_set.push(_set);
            }


            var ctx = $('#visualization_chart');
            ctx.height = 450;
            ctx.width = 450;
            var chart_v = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: m_labels,
                    datasets: _data_set
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxRotation: 90,
                                minRotation: 80
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
        resetNewSourceData() {
            self.new_source = { name: "", color: "#", url: "http://", is_default: false };
        },
        addNewSource() {
            if (!(self.new_source.name.length > 1 && self.new_source.color.length > 3 && self.new_source.url.length > 10)) {
                swal({
                    title: "Sorry :(",
                    text: "Invalid Parameters. New source was not added. \n\nName lenght must be > 1\nColor lenght must be > 3\nURL lenght must be > 10",
                    icon: "error"
                });
                return;
            }

            $('#data-source-input-modal').modal('close');


            //add items to local storage
            var stored_sources = JSON.parse(localStorage.getItem('stored_sources')) || [];
            self.new_source.id = Date.now();
            stored_sources.push(self.new_source);
            localStorage.setItem('stored_sources', JSON.stringify(stored_sources));


            swal({
                title: "Yay!",
                text: "New Source Was Added",
                icon: "success"
            });

            self.loadView();
            self.resetNewSourceData();


        },
        deleteSource(item_id) {
            var stored_sources = JSON.parse(localStorage.getItem('stored_sources')) || [];

            index = -1;
            for (var i = 0; i < stored_sources.length; i++) {
                if (stored_sources[i].id == item_id) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                stored_sources.splice(index, 1);
                localStorage.setItem('stored_sources', JSON.stringify(stored_sources));
                self.loadView();
            }

            $('#data-source-input-modal').modal('close');
            self.resetNewSourceData();


        }

    }
});
