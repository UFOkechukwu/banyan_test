

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
        show_loader: false,
        chart_v:undefined,
        chart_v2:undefined
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
                        var et_avg = self.averageEtByLocation(json_data, data.name, data.color, null);
                        
                        //store averages...
                        self.data_array.push(et_avg);
                    }

                    self.setUpCharts(self.data_array);
                    if (self.data_sources.length == counter) {
                        //self.setUpCharts(self.data_array);
                        self.show_loader = false;
                        //self.setUpSingleCharts(self.data_array);
                        
                        //do analysis on data then show charts
                        self.doAnalysisRequirementOnData(self.data_array);
                    }

                });

            }

        },
        doAnalysisRequirementOnData(data_array){
            //Identify the location with the highest average ET value for each month of the year
            var avg_et_counter = {total: 0, id: -1};

            for (var i = 0; i < data_array.length; i++){
                if(data_array[i].avg_et_total > avg_et_counter.total){
                    avg_et_counter.total = data_array[i].avg_et_total;
                    avg_et_counter.id = i;
                }
            }

            var analyze_data = data_array[avg_et_counter.id];
            //calculate standard deviation
            var sd_value = self.standardDeviation(analyze_data.all_et_val, avg_et_counter.total);

            debugger;
            //get averages
            var et_avg = self.averageEtByLocation(analyze_data.json_data, analyze_data.name, analyze_data.color, sd_value);
                        
            //delete data from array before adding analyzed result...
            data_array.splice(avg_et_counter.id, 1);

            //store averages...
            self.data_array.push(et_avg);

            //Setup Charts
            self.setUpSingleCharts(self.data_array);
        },
        standardDeviation(numbers_arr, mean) {
            //calculate standard deviation
            var mean_diff_sqr = 0;

            for(var key in numbers_arr){
                mean_diff_sqr += Math.pow((parseFloat(numbers_arr[key]) - mean),2);
            }
            
            //return standard deviation...
            return Math.sqrt(mean_diff_sqr/numbers_arr.length);
            
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
        averageEtByLocation(loc_data, name, color, sd_value) {
            total_et_monthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            total_et_days = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            all_et_val = [];

            for (var entry of loc_data) {
                //split date string take month value 
                month = parseInt(entry.date.split("/")[0]);
                et_val = parseFloat(entry.et);
                if(sd_value == null || Math.abs(sd_value - et_val) < 2){
                    //sd_value is null
                    total_et_monthly[month - 1] = total_et_monthly[month - 1] + et_val;
                    total_et_days[month - 1] = total_et_days[month - 1] + 1;

                    //needed for analysis: average et for a year (all months...)
                    all_et_val.push(et_val);
                }
                
            }

            result = {};
            result.avg_high = 0;    //store highest et average for all months...
            for (var i = 0; i < total_et_days.length; i++) {
                //Get average for ET val per month...
                total_et_monthly[i] = total_et_monthly[i] / total_et_days[i];
                if (i == 0 || (i > 0 && total_et_monthly[i] > result.avg_high)) {
                    result.avg_high = total_et_monthly[i];
                    result.month = i;   //0
                }
            }

            //average et for each month of the year...
            result.avg_et = total_et_monthly;

            //------------------------------------------------------------
            //needed for analysis: average et for a year (all months...)
            var _total_et = 0
            for(var _avg_et of total_et_monthly){
                _total_et = _total_et + _avg_et;
            }
            result.avg_et_total = _total_et / total_et_monthly.length;
            result.all_et_val = all_et_val;
            //-------------------------------------------------------------



            //set color
            result.color = color;
            //set name
            result.name = name;

            //keep copy of loc_data for further processing
            result.json_data = loc_data;


            return result;
        },
        setUpCharts(data_array) {

            m_labels = [];
            m_data = [];
            m_colors = [];

            m_labels = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


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

            //Clean up chart
            if(self.chart_v2 != undefined){
                self.chart_v2.destroy(); 
            }
                

            var ctx = $('#visualization_chart_2');
            ctx.height = 450;
            ctx.width = 450;
            self.chart_v2 = new Chart(ctx, {
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
        setUpSingleCharts(data_array) {

            m_labels = [];
            m_data = [];
            m_colors = [];

            y_labels = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


            //Not certain about question requirements
            for(var i = 0; i < data_array.length; i++){
                if(i==0){
                    for(var m1 = 0; m1<12; m1++){
                        m_data[m1] = data_array[i].avg_et[m1];
                        m_colors[m1] = data_array[i].color;
                        m_labels.push(data_array[i].name);
                    }
                }else{
                    for(var m2 = 0; m2<12; m2++){
                        if(m_data[m2] < data_array[i].avg_et[m2]){
                            m_data[m2] = data_array[i].avg_et[m2];
                            m_colors[m2] = data_array[i].color;
                            m_labels[m2] = data_array[i].name;
                        }
                    }
                }

            }


            //Clean up chart
            if(self.chart_v != undefined){
                self.chart_v.destroy(); 
            }

            var _data_set = [{
                labels: m_labels,
                data: m_data,
                backgroundColor: m_colors,
                borderWidth: 1
            }];
                

            var ctx = $('#visualization_chart');
            ctx.height = 450;
            ctx.width = 450;
            self.chart_v = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: y_labels,
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
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                var index = tooltipItem.index;
                                return dataset.labels[index] + ': ' + dataset.data[index];
                            }
                        }
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
