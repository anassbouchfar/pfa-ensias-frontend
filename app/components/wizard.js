import React, { Fragment, useState, useEffect } from 'react';
import StepWizard from '../../dist/react-step-wizard.min';

import Nav from './nav';
import Plugs from './Plugs';

import styles from './wizard.less';
import transitions from './transitions.less';
import axios from 'axios';

/* eslint react/prop-types: 0 */

/**
 * A basic demonstration of how to use the step wizard
 */
const Wizard = () => {
    const [state, updateState] = useState({
        form: {},
        result:{
        },
        transitions: {
            enterRight: `${transitions.animated} ${transitions.enterRight}`,
            enterLeft: `${transitions.animated} ${transitions.enterLeft}`,
            exitRight: `${transitions.animated} ${transitions.exitRight}`,
            exitLeft: `${transitions.animated} ${transitions.exitLeft}`,
            intro: `${transitions.animated} ${transitions.intro}`,
        },
        demo: true, // uncomment to see more
    });

    const updateForm = (key, value) => {
        const { form } = state;
        form[key] = value;
        updateState({
            ...state,
            form,
        });
    };

    const updateResult = (res) =>{
        state.result=res
    }

    // Do something on step change
    const onStepChange = (stats) => {
        // console.log(stats);
    };

    const setInstance = SW => updateState({
        ...state,
        SW,
    });

    const { SW, demo } = state;

    return (
        <div className='container'>
           
            <div className={'jumbotron'}>
                <div className='row'>
                    <div className={`col-12 col-sm-6 offset-sm-3 ${styles['rsw-wrapper']}`}>
                        <StepWizard
                            onStepChange={onStepChange}
                            isHashEnabled
                            transitions={state.transitions} // comment out for default transitions
                            nav={<Nav />}
                            instance={setInstance}
                        >
                            <First hashKey={'FirstStep'} update={updateForm} />
                            <Second form={state.form} update={updateForm}/>
                            <Progress form={state.form} stepName='progress' update={updateResult} />
                            {null /* will be ignored */}
                            <Last res={state} hashKey={'TheEnd!'} />
                        </StepWizard>
                    </div>
                </div>
            </div>
           
            { (demo && SW) && <InstanceDemo SW={SW} /> }
            
        </div>
    );
};

export default Wizard;

/** Demo of using instance */
const InstanceDemo = ({ SW }) => (
    <Fragment>
        <button className={'btn btn-secondary'} onClick={SW.previousStep}>Previous Step</button>
        &nbsp;
        <button className={'btn btn-secondary'} onClick={SW.nextStep}>Next Step</button>
        &nbsp;
        
    </Fragment>
);

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */
const Stats = ({
    currentStep,
    firstStep,
    goToStep,
    lastStep,
    nextStep,
    previousStep,
    totalSteps,
    step,
}) => (
    <div>
       
        { step < totalSteps ?
            <button className='btn btn-primary btn-block' onClick={nextStep}>Continue</button>
            :
            ""
        }
        <hr />
        
            
        <div style={{ fontSize: '21px', fontWeight: '200' }}>
            {
                step>1 &&
                <button className='btn btn-block btn-success' onClick={firstStep}>New System</button>
            }
             {
                step>2 &&
                <button className='btn btn-block btn-primary' onClick={() => goToStep(2)}>New Constraints & Costs</button>
            }
        </div>
        
    </div>
);

/** Steps */

const First = props => {
    const update = (e) => {
        props.update(e.target.name, e.target.value);
    };

    return (
        <div>
            <h3 className='text-center'>Outil d’aide à la décision sous python  </h3>

            <label>Le nombre de sources ( m = disponibilités)</label>
            <input  autocomplete="on"type='number'  min='0'  className='form-control' name='m' placeholder='m'
                onChange={update} />
            <label>Le nombre de Destinations (n = demandes)</label>
            <input  autocomplete="on" required type='number' min='0'  className='form-control' name='n' placeholder='n'
                onChange={update} />
            <Stats step={1} {...props} />
        </div>
    );
};

const Second = props => {
    const validate = () => {
        if (confirm('Are you sure you want to go back?')) { // eslint-disable-line
            props.previousStep();
        }
    };

    const update = (e) => {
        props.update(e.target.name, e.target.value);
    };
    var b_ub = []
    var b_eq = []
    var couts = []
    for (var i = 0; i < props.form.m; i++) {
        b_ub.push(<div><input  autocomplete="on" type='number'  min='0'  className='form-control' name={"B_ub_"+(i+1)} placeholder={"B_ub_"+(i+1)} onChange={update} /></div>)
      }
    for (var i = 0; i < props.form.n; i++) {
        b_eq.push(<div><input  autocomplete="on" type='number'  min='0'  className='form-control' name={"B_eq_"+(i+1)} placeholder={"B_eq_"+(i+1)} onChange={update} /></div>)
      }
    for (var i = 0; i < props.form.n*props.form.m; i++) {
        couts.push(<input  autocomplete="on" type='number'  min='0'  className='form-control' name={"C"+(i+1)} placeholder={"C"+(i+1)} onChange={update} />)
      }  
    return (
        <div>
            {   <h3>m = {props.form.m}, n= {props.form.n}</h3> }
            <h4>disponibilités B_ub (size = {props.form.m})</h4>
           {b_ub}
           <h4>demandes B_eq (size = {props.form.n})</h4>
           {b_eq}
           <h4>Couts (size = {props.form.m}*{props.form.n} = {props.form.m*props.form.n})</h4>
            {couts}
            <Stats step={2} {...props}  />
        </div>
    );
};
/*
var solve = ()=>{
    var matrice = {
        n:3,
        m:2,
        b_ub:[50,20],
        b_eq :[15,20,35],
        C :[12,10,8,7,11,9]
    }
    var result={}
    axios.post(`http://127.0.0.1:8000/solve`,matrice)
    .then(res=>{
        console.log(res.data)
        result = res.data
    })
    .catch(function (error) {
      console.log(error);
    });
    return result
}*/

const Progress = (props) => {
      //var result =solve()
      //console.log(props.form)
    const [state, updateState] = useState({
        isActiveClass: '',
        timeout: null,
    });

    const update = (res) => {
        props.update(res);
        //console.log(props)
    };
  const solve = ()=>{
    var form = props.form
      var b_ub = []
    var b_eq = []
    var C = []
    
    for (let index = 0; index < form.m; index++) {
        b_ub.push(parseInt(form["B_ub_"+(index+1)]))
    }
    for (let index = 0; index < form.n; index++) {
        b_eq.push(parseInt(form["B_eq_"+(index+1)]))
    }
    for (let index = 0; index < (form.n * form.m); index++) {
        C.push(parseInt(form["C"+(index+1)]))
    }
    
  var matrice = {
        n:parseInt(form.n),
        m:parseInt(form.m),
        b_ub:b_ub,
        b_eq :b_eq,
        C :C
    }
    /*var matrice={
        m:2,
        n:3,
        b_ub:[50,20],
        b_eq :[15,20,35],
        C :[12,10,8,7,11,9]
    }*/
    axios.post(`https://pfa-ensias-api.herokuapp.com/solve`,matrice)
        .then(res=>{
        update(res.data)
        //props.nextStep();
        })
        .catch(function (error) {
        console.log(error);
        });
  }
    //this.solve();
    useEffect(() => {
        const { timeout } = state;
        
        
        if (props.isActive && !timeout) {
            solve()
            updateState({
                isActiveClass: styles.loaded,
                timeout: setTimeout(() => {
                    props.nextStep();
                }, 3000),
            });
        } else if (!props.isActive && timeout) {
            clearTimeout(timeout);
            updateState({
                isActiveClass: '',
                timeout: null,
            });
        }
    });

    return (
        <div className={styles['progress-wrapper']}>
            <p className='text-center'>Resolving...</p>
            <div className={`${styles.progress} ${state.isActiveClass}`}>
                <div className={`${styles['progress-bar']} progress-bar-striped`} />
            </div>
        </div>
    );
};

const Last = (props) => {
    
    
    const submit = () => {
        alert('You did it! Yay!') // eslint-disable-line
    };
    const renderX  = (values)=>{
        var l=[]
        for (let index = 1; index <= values.length; index++) 
            l.push(<li>x{index} : {values[index-1]}</li>)
       
        return <ul>{l}</ul>
    }
    
    var res =props.res.result
    var opt  = null
    var listOfResults = []
    if(props.currentStep==4){
        if(Object.keys(res).length !== 0){
            //console.log("res : "+Object.keys(res).length)
            //console.log(res)
           opt = res.fun
            res['nit'] = res["Nombre d'itérations effectuées"];
            delete res['nit'];
            delete res['slack'];
            delete res['con'];
            delete res['status'];
            delete res['fun'];
        for (const [key, value] of Object.entries(res)) {
            if (key=="x"){
                listOfResults.push(<li>X  {renderX(value)}</li>)    
            }else if(key=="success"){
                console.log(res[key])
                if(res[key]) 
                 listOfResults.push(<li>{key }: True</li>) 
                else     listOfResults.push(<li>{key }: False</li>)
            }

            else
                listOfResults.push(<li>{key }: {value}</li>)
          }
          delete res['x'];
        }  
    }
    
    return (
        <div>
            <div className={'text-center'}>
                <h3>The result</h3>
                <hr />
                <h4>Min(Optimum)* : {opt}</h4>
                <ul>
                {listOfResults}
                </ul>
            </div>
            <Stats step={4} {...props} nextStep={submit} />
        </div>
    );
};
