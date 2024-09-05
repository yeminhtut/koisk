import React, { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { Panel } from 'primereact/panel';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';

const TaskBoard = () => {
    const taskGroups = [
        {
            title: 'Overdue',
            tasks: [
                {
                    text: 'Sweep the floor and a two liner text example here',
                    note: 'Please use the new brooms located in the store room',
                    date: 'Daily, 8:00 AM',
                    status: 'NOT STARTED',
                    priority: 'medium',
                    assignedTo: 'Megan Low',
                    assignedBy: 'Shirley Tan',
                    proof: 'No',
                    taskType: 'Housekeeping',
                },
                {
                    text: 'Sweep the floor and a two liner text example here',
                    note: 'Please use the new brooms located in the store room',
                    date: 'Daily, 8:00 AM',
                    status: 'IN PROGRESS',
                    priority: 'medium',
                    assignedTo: 'Megan Low',
                    assignedBy: 'Shirley Tan',
                    proof: 'No',
                    taskType: 'Housekeeping',
                },
                {
                    text: 'Sweep the floor and a two liner text example here',
                    note: 'Please use the new brooms located in the store room',
                    date: 'Daily, 8:00 AM',
                    status: 'COMPLETED',
                    priority: 'medium',
                    assignedTo: 'Megan Low',
                    assignedBy: 'Shirley Tan',
                    proof: 'No',
                    taskType: 'Housekeeping',
                },
            ],
        },
        {
            title: 'Today',
            tasks: [
                {
                    text: 'Print out complain report attached in this task',
                    note: '',
                    date: '12 June 2024',
                    status: 'NOT STARTED',
                    priority: 'high',
                    assignedTo: 'Me',
                    assignedBy: 'Christopher',
                    proof: 'Yes',
                    taskType: 'Admin',
                },
                {
                    text: 'Schedule in a training session',
                    note: 'Monica first day',
                    date: '12 June 2024, 10pm',
                    status: 'NOT STARTED',
                    priority: 'low',
                    assignedTo: 'Me',
                    assignedBy: 'Christopher',
                    proof: 'No',
                    taskType: 'Admin',
                },
            ],
        },
        {
            title: 'Tomorrow',
            tasks: [
                {
                    text: 'Print out complain report attached in this task',
                    note: '',
                    date: '12 June 2024',
                    status: 'NOT STARTED',
                    priority: 'high',
                    assignedTo: 'Me',
                    assignedBy: 'Christopher',
                    proof: 'Yes',
                    taskType: 'Admin',
                },
                {
                    text: 'Schedule in a training session',
                    note: 'Monica first day',
                    date: '12 June 2024, 10pm',
                    status: 'NOT STARTED',
                    priority: 'low',
                    assignedTo: 'Me',
                    assignedBy: 'Christopher',
                    proof: 'No',
                    taskType: 'Admin',
                },
            ],
        },
    ];

    return (
        <div className="p-grid task-board">
            <TaskPanelList taskGroups={taskGroups} />
        </div>
    );
};

const TaskPanelList = (props) => {
    const { taskGroups } = props;

    return (
        <>
            {taskGroups.map((group, index) => (
                <TaskPanel key={index} taskGroup={group} />
            ))}
        </>
    );
};

const TaskPanel = (props) => {
    const [visible, setVisible] = useState(false);
    const { taskGroup } = props;
    const { title, tasks } = taskGroup;
    const headerTemplate = (options) => {
        const className = `${options.className} justify-content-space-between`;
        return (
            <div className={className}>
                <div className="flex align-items-center gap-2">
                    {options.togglerElement}
                    <span className="font-bold">
                        {title} ({tasks.length})
                    </span>
                </div>
            </div>
        );
    };

    const footerTemplate = () => <></>;

    const getServerity = (severity) => {
        if (severity === 'medium') {
            return 'warning'
        } else if(severity === 'high') {
            return 'danger'
        }
        else if (severity === 'low') {
            return 'info'
        }
    }

    const handleView = record => {
        console.log('record', record)
        setVisible(true)
    }

    return (
        <>
            <Panel
            className="mb-4"
            headerTemplate={headerTemplate}
            footerTemplate={footerTemplate}
            toggleable
        >
            {tasks.map((task, idx) => (
                <div
                    className="grid align-items-center justify-content-between task-item"
                    key={idx}
                >
                    <div className="col-fixed">
                        <Checkbox />
                    </div>
                    <div className="col">
                        <div>{task.text}</div>
                        
                    </div>
                    <div className='col'>
                    {task.note && (
                            <div>
                                <strong>Note:</strong> {task.note}
                            </div>
                        )}
                    </div>
                    <div className="col">{task.date}</div>
                    <div className='col'>
                    <div
                        className={`text-xs status ${task.status.replace(' ', '-').toLowerCase()}`}
                    >
                        {task.status}
                    </div>
                    </div>
                   
                    <div className="col-fixed">
                    <Badge className='mr-2' value="!" severity={getServerity(task.priority)} />
                            <span>Priority {task.priority}</span>
                    </div>
                    <div className="col">
                        <span className='fw-700 block mb-1'>
                            Assigned to:
                        </span>
                        {task.assignedTo}</div>
                    <div className="col">
                        <span className='fw-700 block mb-1'>
                            Assigned by:
                        </span> 
                        {task.assignedBy}
                    </div>
                    <div className="col">
                        <span className='fw-700 block mb-1'>
                            Proof:
                        </span>
                        {task.proof}</div>
                    <div className='col'>
                        <div className='text-xs status not-started'>{task.taskType}</div>
                    </div>
                    <div className='col flex'>
                        <span className='underline cursor-pointer' onClick={() => handleView(task)}>View</span>
                    </div>
                </div>
            ))}
        </Panel>
        <Dialog header="Sweep the floor and a two liner text example here" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
        <TaskDetails />
    </Dialog>
        </>
    );
};

const TaskDetails = () => {
    return (
        <>
            <div className="p-grid p-align-center p-justify-between p-mb-3">
                <div className="p-col">
                    <h2 className="task-title">Sweep the floor and a two liner text example here</h2>
                    <p className="task-note">
                        <i className="pi pi-info-circle p-mr-2"></i>
                        Note: Please use the new brooms located in the store room
                    </p>
                    <p className="task-attachment">
                        <i className="pi pi-paperclip p-mr-2"></i>
                        No attachment
                    </p>
                </div>
                <div className="p-col-fixed">
                    <Button label="Edit Assigned Task" className="p-button-secondary" />
                </div>
            </div>
            <div className="grid p-mb-3">
                <div className="p-col-12">
                    <div className="task-details-info">
                        <div className="task-detail-item">
                            <span className="task-detail-title">DATE</span>
                            <span className="task-detail-content">Today</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">REPEAT</span>
                            <span className="task-detail-content">Daily, 8:00 AM</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">STATUS</span>
                            <Badge value="NOT STARTED" className="p-mr-2" />
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">PRIORITY</span>
                            <Badge value="!" severity="warning" />
                            <span className="task-detail-content">Priority medium</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">ASSIGNED TO</span>
                            <span className="task-detail-content">Megan Low</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">ASSIGNED BY</span>
                            <span className="task-detail-content">Me</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">PROOF</span>
                            <span className="task-detail-content">No</span>
                        </div>
                        <div className="task-detail-item">
                            <span className="task-detail-title">TASK TYPE</span>
                            <Button label="Housekeeping" className="p-button-outlined p-button-secondary" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-mb-3">
                <span className="p-input-icon-left">
                    <i className="pi pi-user"></i>
                    <InputTextarea rows={3} placeholder="Type a message" />
                </span>
            </div>
            <div className="grid p-align-center p-justify-between">
                <div className="p-col-fixed">
                    <Avatar icon="pi pi-user" />
                </div>
                <div className="p-col">
                    <p>Created 5th June 2024 at 10:58</p>
                    <p>Updated 5th June at 11:53</p>
                </div>
            </div>
        </>
    );
};

export default TaskBoard;
