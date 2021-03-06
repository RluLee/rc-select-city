'use strict';
import React, { Component } from 'react';
import ReactDOM from "react-dom";
import Tab from './Tab';
import TabCon from './TabCon';
import classSet from './util/classSet';
import {
    Table,
} from 'antd';
import { searchResultArr } from './util/util';
export interface PostionContainerProps {
    matchQ: string;
    loading: boolean;
    searchDataSource: any[];
    setInputValue: (selectVal: number[], selectName: string[]) => void;
    index: number;
    selectVal: number[]
    valIndex: number;
    params: any;
    addressMap: Map<any, any>[];
    changeState: (params: any) => void;
    input: {
        left: number;
        top: number;
        width: number | string;
    }
    show: boolean,
    searching: boolean,
}
class PostionContainer extends Component<PostionContainerProps, {}> {
    private _container: HTMLDivElement;
    constructor(props: PostionContainerProps) {
        super(props);
        this._container = document.createElement('div')
    }
    componentDidMount() {
        document.body.appendChild(this._container);
      }
    componentWillUnmount() {
    // Remove the element from the DOM when we unmount
    document.body.removeChild(this._container);
    }
    highlightReplace(data:string, matchQ:string) {
        let newData = data.replace(matchQ, `*&*${matchQ}*&*`);
        return newData.split('*&*').map((value: any) => {
            if (value === matchQ) {
                return <span style={{ color: '#ff6600' }} key={value}>{value}</span>
            }
            return value;
        });
    }
    highlight = (data: searchResultArr) => {
        let {
            matchQ,
        } = this.props;
        const {
            name,
            firstOfAll,
            totalPY,
        } = data;
        matchQ = matchQ.toLocaleLowerCase();
        if (name.indexOf(matchQ) >= 0) {
            return this.highlightReplace(name, matchQ);
        }

        if (totalPY.indexOf(matchQ) >= 0) {
            return <span>{data.name}（{this.highlightReplace(totalPY, matchQ)}）</span>
        }
        if (firstOfAll.indexOf(matchQ) >= 0) {
            return <span>{data.name}( {this.highlightReplace(firstOfAll.toUpperCase(), matchQ.toUpperCase())} )</span>
        }

        return data.name;
    }
    columns = () => {
        return [
            {
                key: 'city',
                render: (text: {}, record: {} ) => {
                    const arr:React.ReactElement<HTMLSpanElement>[] = [];
                    for(let key in record) {
                        const data = record[key];
                        arr.push(<span key={data.value}>{this.highlight(data)} </span>)
                    }
                    return <div>
                        {arr.map((value, index) => {
                            return <span key={index}>{value}{ index < arr.length - 1 ? '，' : ''}</span>
                        })}
                    </div>
                },
            },
        ]
    }
    handClick(e: React.SyntheticEvent<HTMLDivElement>) {
        /* 阻止冒泡 */
        e.nativeEvent.stopImmediatePropagation();
    }
    tableProps = () => {
        const {
            loading,
            searchDataSource,
            setInputValue,
            selectVal,
        } = this.props;
        let props = {
            size: 'small',
            rowKey: (record: {}) => {
                let key = '';
                for(let i in record) {
                    key += record[i].value;
                }
                return key;
            },
            columns: this.columns(),
            showHeader: false,
            locale: {
                emptyText: '找不到你要的结果，换个试试',
            },
            pagination: {
                size: 'small',
                defaultPageSize: 8,
                showQuickJumper: true,
                showTotal: (total:number , range:[number, number]) => `${range[0]}-${range[1]} of ${total}`,
            },
            loading,
            dataSource: searchDataSource,
            onRow: (record:{}) => {
                return {
                  onClick: () => {
                    let selectVal:number[] = [];
                    let selectName:string[] = [];
                    for(let key in record) {
                        const data = record[key];
                        selectVal.push(data.value);
                        selectName.push(data.name);
                    }
                    setInputValue(selectVal, selectName);
                  },
                };
            },
            rowClassName: (record:{}) => {
                if (selectVal.length <= 0) {
                    return '';
                }
                let rowId = [];
                for(let key in record) {
                    const data = record[key];
                    rowId.push(data.value);
                }
                let className = 'active';
                for (let i = 0, l = selectVal.length; i < l; i++) {
                    if (selectVal[i] !== rowId[i]) {
                        className = ''
                        break;
                    }
                }
                return className;
            }
        } as any;
        return props;
    }
    tabConProps = () => {
        const {
            index,
            selectVal,
            valIndex,
            params,
            addressMap,
            changeState,
        } = this.props;
        return {
            index,
            selectVal,
            valIndex,
            params,
            addressMap,
            changeState,
        };
    }
    render() {
        const {
            input,
            show,
            searching,
            params,
        } = this.props;
        /* className */
        let className = classSet({
            'show': show,
            'postion-container': true
        });



        /* 定位坐标 */
        let style = {
            left: input.left,
            top: input.top,
            width: input.width,
            ...params.popupStyle,
        }


        return ReactDOM.createPortal(
            <div className={className} style={style} onClick={e => this.handClick(e)}>
                {
                    searching ?

                        <Table
                            {...this.tableProps() }
                        />
                        :
                        <div>
                            <Tab {...this.props} />
                            <TabCon {...this.tabConProps() } />
                        </div>
                }
            </div>
        , this._container)
    }
}



export default PostionContainer;




