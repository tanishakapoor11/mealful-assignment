import React, {useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Calendar from 'react-calendar';
import {
  LineChart, BarChart, Bar, ResponsiveContainer, Pie, PieChart, CartesianGrid, Cell, XAxis, YAxis, Line, Legend, Tooltip, Label, Sector,
} from 'recharts';
import Modal from 'react-modal';
import MealData from './db.json';
import logo from './logo.svg';
import './App.css';

function App(props) {

  const [userData, setUserData] = useState([]);
  const [itemDate, setItemDate] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [fdate1, setfdate1] = useState(null);
  const [fdate2, setfdate2] = useState(null);
  const datemap = new Map();
  const schdatemap = new Map();
  const [userPreference, setUserPreference] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [scheduleObj, setScheduleObj] = useState({});
  const [date, setDate] = useState(new Date());
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());

  const colors = ['#3D0053', '#640045', '#460187', '#A31Bb1', '#B14FFF', '#BB00FF', '#740080', '#E800FF', '#090909' ];

  const my_style = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: 'auto',
      transform: 'translate(-50%, -50%)',
    },
  };
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    subtitle.style.color = '#9D089D';
  }

  function closeModal() {
    setIsOpen(false);
  }

  const rad = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * rad);
    const y = cy + radius * Math.sin(-midAngle * rad);

    return (
      <text x={x} y={y} fill = "white" textAnchor={x>cx?'start':'end'} dominantBaseline = "central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleChange = (event) => {
    setItemDate(event.target.value);
    setUserData([]);
    setScheduleObj({});
  }

  const handleChangeDate1 = (event) => {
    setfdate1(event.target.value);
  }

  const handleChangeDate2 = (event) => {
    setfdate2(event.target.value);
  }

  const convert = (str1) => {
    var months = {
      Jan : "01",
      Feb : "02",
      Mar : "03",
      Apr : "04",
      May : "05",
      Jun : "06",
      Jul : "07",
      Aug : "08",
      Sep : "09",
      Oct : "10",
      Nov : "11",
      Dec : "12"
    },
    v = str1.toString().split(" ");
  return [v[3], months[v[1]], v[2]].join("-");  
  }

  const dateview = (event) => {
    console.log(event.value);
    setScheduleDate(event.value);
    var day = event.value;
    console.log(scheduleObj);
    var times = scheduleObj[day];
    console.log(times);

    var ff = [];

    ff.push({timelimit:'0-6',frq:times[0]});
    ff.push({timelimit:'6-12',frq:times[1]});
    ff.push({timelimit:'12-18',frq:times[2]});
    ff.push({timelimit:'18-24',frq:times[3]});

    setTimeData(ff);

    console.log("--------------------");
  }

  const handleSubmit_2dates = (event) => {
    event.preventDefault();

    var dd_1 = convert(date1);
    setfdate1(dd_1);

    var dd_2 = convert(date2);
    setfdate2(dd_2);

    console.log((date2-date1)/86400000);
    var days = [];
    var dateloop = date1;
    if(date2>date1){
      for(let i = 0; i<(((date2- date1)/86400000)+1);i++){
        days.push(convert(dateloop));
        var tomorrow = new Date(dateloop);
        tomorrow.setDate(dateloop.getDate()+1);
        dateloop = tomorrow;
      }
      console.log(days);
      var total = 0;
      var gg = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for(let j=0; j<days.length; j++) {
        MealData.map((mealdetails, index) => {
          if(mealdetails.item_date === days[j]) {
            total+=1;
            var s = mealdetails.schedule_time.split(" ");
            var d1 = new Date(mealdetails.item_date);
            var d2 = new Date(s[0]);
            var prior_days = (d1-d2)/86400000;
            console.log("--------------------");
            console.log(d2);
            console.log(d1);
            console.log(prior_days);
            gg[prior_days] += 1;
            console.log("--------------------");
          }
        });
      }

      console.log(gg);
      console.log(total);
      var df = [
        {title: 'Zero', value: 0},
        {title: 'One', value: 0},
        {title: 'Two', value: 0},
        {title: 'Three', value: 0},
        {title: 'Four', value: 0},
        {title: 'Five', value: 0},
        {title: 'Six', value: 0},
        {title: 'Seven', value: 0},
        {title: 'Eight', value: 0},
        {title: 'Nine', value: 0},
      ];

      for(let j=0;j<10;j++){
        df[j].value = gg[j];
      }
      console.log(df);
      setPieData(df);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    var dd = convert(date);
    console.log(dd);
    setItemDate(dd);
    setScheduleObj({});
    datemap.clear();
    var d = [];

    //eslint-disable-next-line
       MealData.map((mealdetails,index) => {
        if(mealdetails.item_date === itemDate || mealdetails.item_date === dd ) {
          var s = mealdetails.schedule_time.split(" ");
          d.push({day:s, slot: mealdetails.slot})
          if(datemap.has(s[0])) {
            var count = datemap.get(s[0]);
            var arrdata = schdatemap.get(s[0]);
            arrdata.push(s[1]);
            schdatemap.set(s[0], arrdata);
          }
          else {
            datemap.set(s[0],1);
            var a = [];
            a.push(s[1]);
            schdatemap.set(s[0],a);
          }
        }
       });

    setUserData(d);
    console.log(schdatemap.size);
    
    schdatemap.forEach((v,k) => {
      var arrtime=[0,0,0,0];
            v.forEach((a,b)=>{
                console.log(k+" "+a);
                console.log((a[0]+a[1])>9);
                if((a[0]+a[1])>=0 && (a[0]+a[1])<6){
                    arrtime[0]+=1;
                }else if((a[0]+a[1])>=6 && (a[0]+a[1])<12){
                    arrtime[1]+=1;
                }else if((a[0]+a[1])>=12 && (a[0]+a[1])<18){
                    arrtime[2]+=1;
                }else{
                    arrtime[3]+=1;
                }
            });
            console.log(k+" "+arrtime);
            var h=scheduleObj;
            h[k]=arrtime;
            setScheduleObj(h);
    });

    var ldata = [];
    datemap.forEach((v,k) => {
      ldata.push({date:k, orders:v});
    });
    setUserPreference(ldata);
  }


  return (
    <div className="main-container">
      <div className="nav-bar">
        <div className="nav-title">
          MEALFUL INCORPORATION INTERN ASSIGNMENTATION
          <div className="nav-subtitle">
            Submitted by <b>Tanisha Kapoor</b></div>
        </div>
        <div>
          <button onClick = {openModal}>Instructions</button>
        </div>
      </div>
      <Modal
      isOpen = {modalIsOpen}
      onAfterOpen = {afterOpenModal}
      onRequestClose = {closeModal}
      style = {my_style}
      contentLabel = "Example Modal">
        <button onClick = {closeModal}> X </button>
        <h2 ref = {(_subtitle) => (subtitle = _subtitle)}>Instructions</h2> 
        <div>For 444444444448444444444e7                                                                                                             ]\]\\
          4            7988888888888888888888888888888the first graph,</div>
        <div>Select the relevant date to view scheduled distribution</div>
        <div><i>(Try between 2021-05-19 and 2022-01-05)</i></div> <br></br>
        <div>In the first LineChart, select the date label on x-axis to view its time distribution in the second LineChart</div>
        <br></br>
        <div>For the pie chart,</div>
        <div>In the legend, 0 means scheduled date and item date are same, and 1 means scheduled date is 1 day before item_date</div>
        <br></br>
        <div>Press the <b>Show Button</b> to view results.</div>
        
      </Modal>

      <div className ='date_form'>
        <form onSubmit = {handleSubmit}>
          <label >
            <span className ='date-text'>
              Date:
            </span>
            <input type="text" value={itemDate} onChange = {handleChange} className = 'date-input' />
          </label>
          <input type = "submit" value = "Show" />
        </form>
      </div>

      <div style = {{margin: 10}}>
        <Calendar className = "calendar-container-1" onChange = {setDate} value = {date} />
      </div>

      <div className = 'linechart-container'>
        <h1 className = 'text-heading'>
          Graphical Representation of Scheduling
        </h1>
        <ResponsiveContainer width="100%" aspect="3">
          <LineChart data={userPreference} margin={{top:5, right:20, bottom:5, left:0}}>
            <CartesianGrid/>
            <XAxis onClick = {dateview} dataKey="Date" interval={'preserveStartEnd'}/>
            <YAxis/>
            <Legend/>
            <Tooltip/>
            <Line dataKey="orders" activeDot={{r:8}} stroke="#8884D8" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className = 'linechart-container'>
        <h1 className = 'text-heading'>
          Time Distribution: {scheduleDate}
        </h1>
        <ResponsiveContainer width="100%" aspect="3">
          <BarChart data = {timeData} margin={{top:5, right:20, bottom:5, left:0}}>
            <Bar dataKey="frq" fill = "#8C5CCD"/>
            <Tooltip/>
            <XAxis dataKey="timelimit"/>
            <YAxis />
          </BarChart>
        </ResponsiveContainer>
      </div>  

      <div className="linechart-container">
        <h1>Pie Chart of the Data</h1>
        <div className='row-container'>
          <form style={{padding:70}}>
            <label>Date:
              <input type="text" value={fdate1} onChange={handleChangeDate1}/>
            </label>
          </form>
          <form onSubmit={handleSubmit_2dates} style={{padding:70}}>
            <label style={{padding:10}}>
              Date:
              <input type="text" value={fdate2} onChange={handleChangeDate2} />

            </label>
            <input type="submit" value = "Show"/>
          </form>
        </div>

        <div className="row-container">
        <div style={{padding:50}} >
           <Calendar 
            className="calender-container_2"
            onChange={setDate1} 
            value={date1} 
        />
        </div>
        <div style={{padding:50}} >
           <Calendar 
            className="calender-container_2"
            onChange={setDate2} 
            value={date2} 
        />
      </div>
    </div>
    <PieChart width={1000} height={500} Legend={true}>
      <Pie data={pieData} cx={550} cy={200} labelLine={false} label={renderCustomizedLabel} outerRadius={200} fill="#8884D8" dataKey="value">
        {
          pieData.map((entry, index) => <Cell key = {`cell-${index}`} fill={colors[index % colors.length]}/>)
        }
      </Pie>
      <Tooltip/>
      <Legend/>
    </PieChart>
    </div>
    <div className='linechart-container' style={{height:10}}>
      <img className='img' src='https://www.mealful.ca/mealfulWebAssets/img/mealful-22.svg' alt="new"/>
    </div>
    </div>
  );


}

export default App;
