/* A missed answer resets the current combo, never the best combo of this run. */
(() => {
  const originalBegin=begin;
  begin=(...args)=>{state.maxCombo=0;return originalBegin(...args)};
  const originalSubmit=submit;
  submit=(...args)=>{
    const result=originalSubmit(...args);
    state.maxCombo=Math.max(Number(state.maxCombo)||0,Number(state.combo)||0);
    return result;
  };
  const originalRecord=makeRecord;
  makeRecord=(...args)=>({...originalRecord(...args),maxCombo:Math.max(Number(state.maxCombo)||0,Number(state.combo)||0)});
  const originalMenu=menu;
  menu=(...args)=>{
    const result=originalMenu(...args);
    const records=state.records.slice(-10).reverse();
    [...recordList.children].forEach((node,i)=>{
      if(!Number.isFinite(records[i]?.maxCombo))return;
      const detail=document.createElement('span');
      detail.textContent=` | 最高連擊 ${records[i].maxCombo}`;
      node.append(detail);
    });
    return result;
  };
  state.maxCombo=Number(state.combo)||0;
})();
