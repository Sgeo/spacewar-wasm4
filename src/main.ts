import * as w4 from "./wasm4";

var ac=0, io=0, pc=4, y, ib, ov=0; 
var flag = [false, false, false, false, false, false, false];
var sense = [false, false, false, false, false, false, false];
var control=0;


var k17=0o400000, k18=0o1000000, k19=0o2000000, k35=0o400000000000;

var AND=0o01, IOR=0o02, XOR=0o03, XCT=0o04, CALJDA=0o07,
    LAC=0o10, LIO=0o11, DAC=0o12, DAP=0o13, DIO=0o15, DZM=0o16,
    ADD=0o20, SUB=0o21, IDX=0o22, ISP=0o23, SAD=0o24, SAS=0o25, MUS=0o26, DIS=0o27,
    JMP=0o30, JSP=0o31, SKP=0o32, SFT=0o33, LAW=0o34, IOT=0o35, OPR=0o37;


function handleKeydown(e){
	var c = e.keyCode;
	c = String.fromCharCode(c);
	if (c=='W') control |= 0o1;
	if (c=='S') control |= 0o2;
	if (c=='A') control |= 0o4;
	if (c=='D') control |= 0o10;
	if (c=='I')control |= 0o40000;
	if (c=='K') control |= 0o100000;
	if (c=='J') control |= 0o200000;
	if (c=='L') control |= 0o400000;
}

function handleKeyup(e){
	var c = e.keyCode;
	c = String.fromCharCode(c);
	if (c=='W') control &= ~0o1;
	if (c=='S') control &= ~0o2;
	if (c=='A') control &= ~0o4;
	if (c=='D') control &= ~0o10;
	if (c=='I')control &= ~0o40000;
	if (c=='K') control &= ~0o100000;
	if (c=='J') control &= ~0o200000;
	if (c=='L') control &= ~0o400000;
}

export function update(){
	ctx.clearRect(0,0,550,550);
	while(pc!=0o2051) step();
	step();
	while(pc!=0o2051) step();
	step();
}

function step(){
	dispatch(memory[pc++]);
}

function dispatch(md) {
	y=md&0o7777; ib=(md>>12)&1;
	switch(md>>13) {
	case AND: ea(); ac&=memory[y]; break;
	case IOR: ea(); ac|=memory[y]; break;
	case XOR: ea(); ac^=memory[y]; break;
	case XCT: ea(); dispatch(memory[y]); break;
	case CALJDA: 
		var target=(ib==0)?64:y;
		memory[target]=ac;
		ac=(ov<<17)+pc;
		pc=target+1;
		break;
	case LAC: ea(); ac=memory[y]; break;
	case LIO: ea(); io=memory[y]; break;
	case DAC: ea(); memory[y]=ac; break;
	case DAP: ea(); memory[y]=(memory[y]&0o770000)+(ac&0o7777); break;
	case DIO: ea(); memory[y]=io; break;
	case DZM: ea(); memory[y]=0; break;
	case ADD:
		ea();
		ac=ac+memory[y];
		ov=ac>>18;
		ac=(ac+ov)&0o777777;
		if (ac==0o777777) ac=0;
		break;
	case SUB:
		ea();
		var diffsigns=((ac>>17)^(memory[y]>>17))==1;
		ac=ac+(memory[y]^0o777777);
		ac=(ac+(ac>>18))&0o777777;
		if (ac==0o777777) ac=0;
		if (diffsigns&&(memory[y]>>17==ac>>17)) ov=1;
		break;
	case IDX:
		ea(); 
		ac=memory[y]+1; 
		if(ac==0o777777) ac=0;
		memory[y]=ac;
		break;
	case ISP:
		ea();
		ac=memory[y]+1; 
		if(ac==0o777777) ac=0;
		memory[y]=ac;
		if((ac&0o400000)==0) pc++;
		break;
	case SAD: ea(); if(ac!=memory[y]) pc++; break;
	case SAS: ea(); if(ac==memory[y]) pc++; break;
	case MUS:
		ea();
		if ((io&1)==1){
			ac=ac+memory[y];
			ac=(ac+(ac>>18))&0o777777;
			if (ac==0o777777) ac=0;
		}
		io=(io>>1|ac<<17)&0o777777;
		ac>>=1;
		break;
	case DIS:
		ea();
		var acl=ac>>17;
		ac=(ac<<1|io>>17)&0o777777;
		io=((io<<1|acl)&0o777777)^1;
		if ((io&1)==1){
			ac=ac+(memory[y]^0o777777);
			ac=(ac+(ac>>18))&0o777777;}
		else {
			ac=ac+1+memory[y];
			ac=(ac+(ac>>18))&0o777777;
		}
		if (ac==0o777777) ac=0;
		break;
	case JMP: ea(); pc=y; break;
	case JSP: ea(); ac=(ov<<17)+pc; pc=y; break;
	case SKP:
		var cond =
			(((y&0o100)==0o100)&&(ac==0)) ||
			(((y&0o200)==0o200)&&(ac>>17==0)) ||
			(((y&0o400)==0o400)&&(ac>>17==1)) ||
			(((y&0o1000)==0o1000)&&(ov==0)) ||
			(((y&0o2000)==0o2000)&&(io>>17==0))||
			(((y&7)!=0)&&!flag[y&7])||
			(((y&0o70)!=0)&&!sense[(y&0o70)>>3])||
			((y&0o70)==0o10);
		if (ib==0) {if (cond) pc++;}
		else {if (!cond) pc++;}
		if ((y&0o1000)==0o1000) ov=0;
		break;
	case SFT:	
		var nshift=0, mask=md&0o777;
		while (mask!=0) {nshift+=mask&1; mask=mask>>1;}
		switch((md>>9)&0o17){
		case 1: for(var i=0;i<nshift;i++) ac=(ac<<1|ac>>17)&0o777777; break;
		case 2: for(var i=0;i<nshift;i++) io=(io<<1|io>>17)&0o777777; break;
		case 3:	
			for(var i=0;i<nshift;i++){
				var both=ac*k19+io*2+Math.floor(ac/k17);
				ac = Math.floor(both/k18)%k18;
				io = both%k18;
			}
			break;
		case 5: 
			for(var i=0;i<nshift;i++) ac=((ac<<1|ac>>17)&0o377777)+(ac&0o400000);
			break;
		case 6: 
			for(var i=0;i<nshift;i++) io=((io<<1|io>>17)&0o377777)+(io&0o400000);
			break;
		case 7:	
			for(var i=0;i<nshift;i++) {
				var both = (ac&0o177777)*k19+io*2+Math.floor(ac/k17);
				both += (ac&0o400000)*k18;
				ac = Math.floor(both/k18)%k18;
				io = both%k18;
			}
			break;
		case 9: for(var i=0;i<nshift;i++) ac=(ac>>1|ac<<17)&0o777777; break;
		case 10: for(var i=0;i<nshift;i++) io=(io>>1|io<<17)&0o777777; break;
		case 11: 
			for(var i=0;i<nshift;i++){
				var both = ac*k17+Math.floor(io/2)+(io&1)*k35;
				ac = Math.floor(both/k18)%k18;
				io = both%k18;
			}
			break;
		case 13: for(var i=0;i<nshift;i++) ac=(ac>>1)+(ac&0o400000); break;
		case 14: for(var i=0;i<nshift;i++) io=(io>>1)+(io&0o400000); break;
		case 15: 
			for(var i=0;i<nshift;i++){
				var both = ac*k17+Math.floor(io/2)+(ac&0o400000)*k18;
				ac = Math.floor(both/k18)%k18;
				io = both%k18;
			}
			break;
		default:	console.log('Undefined shift:',os(md),'at'+os(pc-1));
      //Runtime.getRuntime().exit(0);
      	}	
      break;
	case LAW: ac=(ib==0)?y:y^0o777777; break;
	case IOT: 
		if ((y&0o77)==7) {dpy();break;};
		if ((y&0o77)==0o11) {io = control; break;}
		break;
	case OPR:	
		if((y&0o200)==0o200) ac=0;
		if((y&0o4000)==0o4000) io=0;
		if((y&0o1000)==0o1000) ac^=0o777777;
		if((y&0o400)==0o400) panelrunpc = -1;
		var nflag=y&7; 
		if (nflag<2) break;
		var state=(y&0o10)==0o10;
		if (nflag==7) {
			for (var i=2;i<7;i++) flag[i]=state;
			break;
		}
		flag[nflag]=state;
		break;
	default:	console.log('Undefined instruction:', os(md), 'at', os(pc-1));
    //Runtime.getRuntime().exit(0);
  }
}

function ea() {
	while(true){
		if (ib==0) return;
		ib=(memory[y]>>12)&1;
		y=memory[y]&0o7777;
	}
}

function dpy(){
	var x=(ac+0o400000)&0o777777;
	var y=(io+0o400000)&0o777777;
	x=x*550/0o777777; y=y*550/0o777777;
	ctx.fillRect(x,y,1,1);
}


function os(n){
	n += 0o1000000;
	return '0'+ n.toString(8).substring(1);
}
    
function regs(){
	console.log('pc:', os(pc), 'mpc:', os(memory[pc]), 'ac:', os(ac), 'io;', os(io), 'ov:', ov);
}