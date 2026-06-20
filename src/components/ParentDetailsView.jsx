import React, { useState, useMemo } from 'react';
import { Users, Search, Download, Phone, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';

const defaultParentData = [
    { sno: 1, hno: '23B21A4517', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'MANCHALA JYOTSNA', bCode: 'AID', stContact: '8790750267', parentNames: 'MANCHALA SUBBAYAMMA', p1: 'NA', p2: '9000603454' },
    { sno: 2, hno: '23B21A4518', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'VELAMA SYAMALA', bCode: 'AID', stContact: '7997649939', parentNames: 'VELAMA LAKSHMI NARAYANA/VELAMA SARASWATHI', p1: '9390747149', p2: '9032199197' },
    { sno: 3, hno: '23B21A4519', classId: 'K12AIDHA', staying: 'OWN TRANSPORT', dept: 45, name: 'NALLE TRINAINI VIJAYA LEELA', bCode: 'AID', stContact: '7036608011', parentNames: 'N VENKATA RAMANA/NALLE SASIKALA', p1: '7396864279', p2: '7567145279' },
    { sno: 4, hno: '23B21A4520', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'MAMILLAPALLI MONIKA', bCode: 'AID', stContact: '9100075213', parentNames: 'MAMILLAPALLI VEERABHADRA RAO/MAMILLAPALLI RAJYALAKSHMI', p1: '7799297114', p2: '' },
    { sno: 5, hno: '23B21A4521', classId: 'K12AIDHA', staying: 'OWN TRANSPORT', dept: 45, name: 'JAGGAMSETTI JAHNAVI DEVI', bCode: 'AID', stContact: '9010611837', parentNames: 'JAGGAMSETTI SWAMY/JAGGAMSETTI YASOVARDHINI', p1: '9493571068', p2: '8297661570' },
    { sno: 6, hno: '23B21A4522', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GADDAM MANASA PRIYA', bCode: 'AID', stContact: '9652928580', parentNames: 'GADDAM SATISH KUMAR/GADDAM SUVARNA LAKSHMI', p1: '9848191987', p2: '9154588580' },
    { sno: 7, hno: '23B21A4523', classId: 'K12AIDHA', staying: 'OWN TRANSPORT', dept: 45, name: 'SADI NAVYA SRI', bCode: 'AID', stContact: '8688934178', parentNames: 'SADI POLA REDDY/SADI BHARATHI', p1: '7993403817', p2: '' },
    { sno: 8, hno: '23B21A4524', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KUTCHU SHIVA MANI', bCode: 'AID', stContact: '7416677871', parentNames: 'KUTCHU MANGU NAIDU/KUTCHU MAHESWARI', p1: '9573624478', p2: '' },
    { sno: 9, hno: '23B21A4525', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'DASARI RAMYA', bCode: 'AID', stContact: '9640538804', parentNames: 'DASARI SRINIVASA RAO/DASARI JYOTHI', p1: '9492017043', p2: '' },
    { sno: 10, hno: '23B21A4526', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GALLA DURGA BHAVANI', bCode: 'AID', stContact: '9949161736', parentNames: 'GALLA RAMBABU/GALLA VARALAKSHMI', p1: '9885996899', p2: '8885341446' },
    { sno: 11, hno: '23B21A4527', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'CHITTIBOYINA PUJITHA', bCode: 'AID', stContact: '8639837538', parentNames: 'CHITTIBOYINA RAMESH/CHITTIBOYINA RAJINI', p1: '9392562185', p2: '9701234828' },
    { sno: 12, hno: '23B21A4530', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GUTTULA DEVI SRI', bCode: 'AID', stContact: '8019380926', parentNames: 'GUTTULA SRINIVASA CHINTANA/GUTTULA RENUKA', p1: '9618576614', p2: '' },
    { sno: 13, hno: '23B21A4531', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'MODI PRANATHI SRI', bCode: 'AID', stContact: '8885028033', parentNames: 'MODI MAHESH/MODI SWATHI', p1: '9441049593', p2: '7995827234' },
    { sno: 14, hno: '23B21A45A0', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NOMULA TEJA', bCode: 'AID', stContact: '9640124847', parentNames: 'NOMULA MARUTHI HARIBABU/NOMULA SUDHARANI', p1: '9849080107', p2: '9949647113' },
    { sno: 15, hno: '23B21A45A2', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KRISHTIPATI RAMANA REDDY', bCode: 'AID', stContact: '6303120608', parentNames: 'KRISHTIPATI SUDHAKAR REDDY/KRISHTIPATI NAGAMANI', p1: '6281497848', p2: 'NA' },
    { sno: 16, hno: '23B21A45A3', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'BALLA PURNA KUMAR', bCode: 'AID', stContact: '7981463993', parentNames: 'BALLA SURYA MALLESWARA RAO/BALLA RAJYA LAKSHMI', p1: '9491163211', p2: '' },
    { sno: 17, hno: '23B21A45A4', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'MAGANTI PRASAD', bCode: 'AID', stContact: '7993055369', parentNames: 'MAGANTI VIJAYA RAJU/MAGANTI VIJAYA LAKSHMI', p1: '9704275749', p2: '9390623689' },
    { sno: 18, hno: '23B21A45A5', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NUNNA KARTHIK', bCode: 'AID', stContact: '7013477737', parentNames: 'NUNNA VEERA VENKATA RATNAM/ARIMILLI SUNDHARA MANIKYAM', p1: '', p2: '7993148045' },
    { sno: 19, hno: '23B21A45A6', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'MANDADI NAGARATNAKAR', bCode: 'AID', stContact: '7981224969', parentNames: 'M SIMHACHALAM/M NIRMALA', p1: '9441313363', p2: '8688742025' },
    { sno: 20, hno: '23B21A45A7', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KALLEPALLI CHANDRASEKHAR', bCode: 'AID', stContact: '8897874018', parentNames: 'KALLEPALLI SRINIVASARAO/KALLEPALLI ARUNA', p1: '9701883696', p2: '8143670221' },
    { sno: 21, hno: '23B21A45A8', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'TUMPALA JAGAN', bCode: 'AID', stContact: '6300180948', parentNames: 'TUMPALA APPARAO/TUMPALA NAGABHUSHANAM', p1: '9666698221', p2: '6300180948' },
    { sno: 22, hno: '23B21A45A9', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'BODDUPALLI PRASANTH', bCode: 'AID', stContact: '7993112387', parentNames: 'BODDUPALLI SURAYYA/BODDUPALLI SUNITHA', p1: '8008929029', p2: '' },
    { sno: 23, hno: '23B21A45B0', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'TAMARANA PAVAN KUMAR', bCode: 'AID', stContact: '7207780643', parentNames: 'TAMARANA APPALANAIDU/TAMARANA NAGAMANI', p1: '8050701963', p2: '7893423852' },
    { sno: 24, hno: '23B21A45B2', classId: 'K12AIDHA', staying: 'OWN TRANSPORT', dept: 45, name: 'PAILA PRADEEP', bCode: 'AID', stContact: '7730876825', parentNames: 'PAILA RAMBABU', p1: '9182103173', p2: '9381299713' },
    { sno: 25, hno: '23B21A45B3', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'TALAVALASA SAI KUMAR', bCode: 'AID', stContact: '7286813844', parentNames: 'TALAVALASA SHANKAR RAO/TALAVALASA PARVATHI', p1: '9705545844', p2: '' },
    { sno: 26, hno: '23B21A45B4', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'VANAMA AKHIL', bCode: 'AID', stContact: '9515233587', parentNames: 'V. RAJU', p1: '8985671838', p2: '7095314664' },
    { sno: 27, hno: '23B21A45B5', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KOLUSU AVINASH', bCode: 'AID', stContact: '9110703882', parentNames: 'KOLUSU RAGHAVENDRA PRASAD/KOLUSU BHANUMATHI', p1: '9885883142', p2: '8790488146' },
    { sno: 28, hno: '23B21A45B6', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'PERAM JAYA PRAKASH', bCode: 'AID', stContact: '9391450262', parentNames: 'PERAM RAJU/PERAM SUBHADRA', p1: '', p2: '6304043649' },
    { sno: 29, hno: '23B21A45B7', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NIMMAGADDA GIRISH', bCode: 'AID', stContact: '9676275542', parentNames: 'NIMMAGADDA NAGESWARA RAO/NIMMAGADDA NAGESWARI', p1: '9908328455', p2: '9959338287' },
    { sno: 30, hno: '23B21A45B8', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'BANKA MADHU', bCode: 'AID', stContact: '9346198804', parentNames: 'BANKA APPALASWAMY/BANKA GOWRI', p1: '7799871597', p2: '' },
    { sno: 31, hno: '23B21A45B9', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NAGABATHULA SYAMKUMAR', bCode: 'AID', stContact: '7981081339', parentNames: 'NAGABATHULA VIJAYA KUMAR/NAGABUTHULA DURGA', p1: '7730852157', p2: '9949301139' },
    { sno: 32, hno: '23B21A45C0', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'SUDAGANI SAI PHANINDRA', bCode: 'AID', stContact: '6303203994', parentNames: 'SUDAGANI RATALARAO/SUDAGANI VENKATESWARAMMA', p1: '9704200748', p2: 'NA' },
    { sno: 34, hno: '23B21A45C3', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'BAMMIDI WILLIAM CAREY', bCode: 'AID', stContact: '8074066928', parentNames: 'BAMMIDI BALA KRISHNA/BAMMIDI LAKSHMI', p1: '7801002900', p2: '7013206580' },
    { sno: 36, hno: '23B21A45C5', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KUNDETI YASWANTH SINHA', bCode: 'AID', stContact: '7702515289', parentNames: 'KUNDETI MURALI KRISHNA/KUNDETI SWARNA KUMARI', p1: '9989598438', p2: 'NA' },
    { sno: 37, hno: '23B21A45C6', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NERSU NAGA VAMSI KRISHNA', bCode: 'AID', stContact: '8978067626', parentNames: 'NERSU VEERA VENKATA SATYANARAYANA', p1: '6309437566', p2: '7993967626' },
    { sno: 38, hno: '23B21A45C7', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GHANTASALA SAIRAJGOPAL', bCode: 'AID', stContact: '9515805588', parentNames: 'GHANTASALA PARDHASARADHI/GHANTASALA RATNA MANIKYAM', p1: '9948169643', p2: '8074596581' },
    { sno: 39, hno: '23B21A45C8', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KONAKALLA DILEEP KUMAR', bCode: 'AID', stContact: '9347676479', parentNames: 'KONAKALLA RAMBABU', p1: '9640569203', p2: '6305563963' },
    { sno: 40, hno: '23B21A45C9', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'NARADALA BALA MANIKANTA', bCode: 'AID', stContact: '6305199044', parentNames: 'NARADALA GANDHI', p1: '9030150615', p2: '7995892372' },
    { sno: 42, hno: '23B21A45D1', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'BOJANKI JASWANTH KUMAR', bCode: 'AID', stContact: '8019334636', parentNames: 'BOJANKI APPALA NAIDU/BOJANKI RAMANAMMA', p1: '9963704636', p2: '9989708549' },
    { sno: 43, hno: '23B21A45D2', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'PALUGULLA SWAMI RANGA REDDY', bCode: 'AID', stContact: '9701364067', parentNames: 'PALUGULLA PANDU RANGA REDDY/PALUGULLA JAYAMMA', p1: '', p2: '8096147073' },
    { sno: 44, hno: '23B21A45D3', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'REDDYBOINA VENKATA HIMACHANDRA', bCode: 'AID', stContact: '6281062868', parentNames: 'REDDYBOINA VENKATA RAMANA/REDDYBOINA MAHALAKSHAMMA', p1: '8096562535', p2: '' },
    { sno: 45, hno: '23B21A45D4', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GOGADA SHANMUKA ESWARA RAO', bCode: 'AID', stContact: '8341360268', parentNames: 'GOGADA V S S NARAYANA MURTHY/GOGADA PARVATHI', p1: '9515337713', p2: '7995903378' },
    { sno: 46, hno: '23B21A45D6', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'ANDHE AAKASH', bCode: 'AID', stContact: '7416414129', parentNames: 'ANDHE ESWARA RAO/ANDHE SATYAVATHI', p1: '9177386975', p2: '9381826663' },
    { sno: 47, hno: '23B21A45D7', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'CHAKIRI KRISHNA SAI DURGA PAVAN KUMAR', bCode: 'AID', stContact: '9542882755', parentNames: 'CHAKIRI AYYANNA/CHAKIRI SATYAVATHI', p1: '9550913605', p2: '' },
    { sno: 48, hno: '23B21A45D8', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'GUDE SAI KIRAN', bCode: 'AID', stContact: '9553356637', parentNames: 'GUDE SURI BABU/GUDE MANGA TAYARU', p1: '8332962275', p2: '7702482905' },
    { sno: 49, hno: '23B21A45G2', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'ANKAMREDDY BHANU PRASAD', bCode: 'AID', stContact: '9182103173', parentNames: 'ANKAMREDDY VENKATA RAMANA', p1: '9676614446', p2: '' },
    { sno: 50, hno: '24B25A4504', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'AYYANKI THANUSHA', bCode: 'AID', stContact: '8919133015', parentNames: 'AYYANKI SRINIVASA RAO', p1: '', p2: '9440595102' },
    { sno: 51, hno: '24B25A4507', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'ARJAMPUDI MOKSHA VARSHITHA', bCode: 'AID', stContact: '9704911399', parentNames: 'ARJAMPUDI BRAHMESWARA RAO/ARJAMPUDI DEVIPARVATHI', p1: '7075711399', p2: '7993562182' },
    { sno: 53, hno: '236Q1A4503', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'DASAMSETTI ABHICHANDANA', bCode: 'AID', stContact: '7842481588', parentNames: 'DASAMSETTI SRINIVASA RAO/DASAMSETTI VEERA VENKATA SATYAVATHI', p1: '', p2: '9542871585' },
    { sno: 54, hno: '236Q1A4504', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'SANAPATHI SUSMITHA', bCode: 'AID', stContact: '9542386374', parentNames: 'SANAPATHI APPALANAIDU/SANAPATHI SUSEELA', p1: '9177132735', p2: '9515156917' },
    { sno: 56, hno: '236Q1A4521', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'TADICHARLA RATHNAM RAJU', bCode: 'AID', stContact: '7207032469', parentNames: 'TADICHARLA RAMU/TADICHARLA PADMA', p1: '9573584314', p2: '' },
    { sno: 57, hno: '236Q1A4522', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'KONDI YUVARAJU', bCode: 'AID', stContact: '8523065075', parentNames: 'KONDI VENKATA APPARAO/KONDI PRAVEENA', p1: '9573198567', p2: '8125665075' },
    { sno: 58, hno: '236Q1A4523', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'RAVADA HARSHA VARDHAN', bCode: 'AID', stContact: '9573263238', parentNames: 'RAVADA SRINIVASU/RAVADA NAGA VARA LAKSHMI DEVI', p1: '9573395551', p2: '8309422276' },
    { sno: 59, hno: '236Q1A4524', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'RAJANA RAJA SEKHAR', bCode: 'AID', stContact: '9346171370', parentNames: 'RAJANA POTHU RAJU/RAJANA RAMANAMMA', p1: '8919584589', p2: '6300608195' },
    { sno: 60, hno: '236Q1A4525', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'RAMISETTI HEMANTH', bCode: 'AID', stContact: '8555039060', parentNames: 'RAMISETTI GOVINDA RAO/RAMISETTI KALAVATHI', p1: '9652198512', p2: '8008040663' },
    { sno: 61, hno: '236Q1A4526', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'REGETI SATISH KUMAR', bCode: 'AID', stContact: '7702098439', parentNames: 'REGETI KRISHNA RAO/REGETI KAMALA', p1: '8978587613', p2: '' },
    { sno: 62, hno: '236Q1A4527', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'VEMULA LOHITH KUMAR', bCode: 'AID', stContact: '7780731875', parentNames: 'VEMULA BRAHMENDRA RAO/VEMULA KOTESWARAMMA', p1: '8142009565', p2: '' },
    { sno: 65, hno: '236Q1A4530', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'JYOTHULA DANI VICTOR', bCode: 'AID', stContact: '9346717638', parentNames: 'JYOTHULA BABU/JYOTHULA SUBHASHINI', p1: '7569683395', p2: '9346717638' },
    { sno: 66, hno: '236Q1A4531', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'YERIPILLI DHANUSH RAJA', bCode: 'AID', stContact: '8328179657', parentNames: 'YERIPILLI APPALA RAJU/YERIPILLI JAYALAKSHMI', p1: '8341422183', p2: '' },
    { sno: 67, hno: '236Q1A4532', classId: 'K12AIDHA', staying: 'CLG HOSTEL', dept: 45, name: 'PEDDINTI HARISH KUMAR', bCode: 'AID', stContact: '6301114293', parentNames: 'PEDDINTI VENKATARAMANA/YEDURESU KONDAMMA', p1: '8639313624', p2: '' },
];

const PhoneCell = ({ number }) => {
    if (!number || number === 'NA' || number.trim() === '') {
        return <span className="text-gray-300 text-xs">—</span>;
    }
    return (
        <a
            href={`tel:${number}`}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-mono font-semibold hover:underline"
        >
            <Phone className="w-3 h-3 shrink-0" />
            {number}
        </a>
    );
};

// Edit Modal for Parent Details
const EditParentModal = ({ record, onSave, onClose, directAccess }) => {
    const [form, setForm] = useState({ ...record });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Edit Contact Info</p>
                        <h3 className="text-white text-lg font-bold">{record.name}</h3>
                        <p className="text-indigo-300 text-xs font-mono">{record.hno}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">HNO (Roll No)</label>
                            {directAccess ? (
                                <input value={form.hno} onChange={e => set('hno', e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-mono" />
                            ) : (
                                <input value={form.hno} readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed font-mono" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Contact</label>
                            <input value={form.stContact} onChange={e => set('stContact', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Staying Status</label>
                            <select value={form.staying} onChange={e => set('staying', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                                <option>CLG HOSTEL</option>
                                <option>OWN TRANSPORT</option>
                                <option>DAY SCHOLAR</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Name(s)</label>
                            <input value={form.parentNames} onChange={e => set('parentNames', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Contact 1</label>
                            <input value={form.p1} onChange={e => set('p1', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Contact 2</label>
                            <input value={form.p2} onChange={e => set('p2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-1">
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ParentDetailsView = ({ parentDataOverrides = {}, setParentDataOverrides, directAccess }) => {
    const parentData = useMemo(() =>
        defaultParentData.map(r => parentDataOverrides[r.hno] ? { ...r, ...parentDataOverrides[r.hno] } : r),
        [parentDataOverrides]
    );
    const [search, setSearch] = useState('');
    const [editingRecord, setEditingRecord] = useState(null);

    const filtered = useMemo(() => {
        return parentData.filter(s => {
            const q = search.toLowerCase();
            return (
                s.name.toLowerCase().includes(q) ||
                s.hno.toLowerCase().includes(q) ||
                s.parentNames.toLowerCase().includes(q) ||
                s.stContact.includes(q) ||
                s.p1.includes(q) ||
                s.p2.includes(q)
            );
        });
    }, [parentData, search]);

    const handleSave = (updated) => {
        if (setParentDataOverrides) {
            setParentDataOverrides(prev => {
                const newData = { ...prev };
                // If hno changed, remove the old one
                if (editingRecord.hno !== updated.hno) {
                    delete newData[editingRecord.hno];
                }
                newData[updated.hno] = updated;
                return newData;
            });
        }
        setEditingRecord(null);
    };

    const handleDelete = (hno) => {
        if (window.confirm(`Remove overrides for ${hno}?`)) {
            setParentDataOverrides(prev => {
                const newData = { ...prev };
                delete newData[hno];
                return newData;
            });
        }
    };

    const handleAddRecord = () => {
        const roll = prompt('Enter Roll No for new parent record override:');
        if (!roll) return;
        const newRecord = {
            hno: roll,
            name: '',
            classId: 'K12AIDHA',
            staying: 'CLG HOSTEL',
            dept: 45,
            bCode: 'AID',
            stContact: '',
            parentNames: '',
            p1: '',
            p2: ''
        };
        setParentDataOverrides(prev => ({ ...prev, [roll]: newRecord }));
        setEditingRecord(newRecord);
    };

    const exportToExcel = () => {
        const rows = filtered.map((s, i) => ({
            'S.No': i + 1,
            'HNO': s.hno,
            'Class ID': s.classId,
            'Dept': s.dept,
            'Student Name': s.name,
            'B-Code': s.bCode,
            'Student Contact': s.stContact,
            'Parent Name(s)': s.parentNames,
            'Parent Contact 1': s.p1 || '—',
            'Parent Contact 2': s.p2 || '—',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 6 },
            { wch: 38 }, { wch: 8 }, { wch: 14 }, { wch: 48 }, { wch: 14 }, { wch: 14 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Parent Details');
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_Parent_Details_${today}.xlsx`);
    };

    return (
        <div className="space-y-6 p-4 md:p-8">
            {editingRecord && (
                <EditParentModal
                    record={editingRecord}
                    onSave={handleSave}
                    onClose={() => setEditingRecord(null)}
                    directAccess={directAccess}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        Parent Details
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Branch: AID &nbsp;|&nbsp; Class: K12AIDHA &nbsp;|&nbsp; CTPO: Mr. G. Rajendra Babu</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {directAccess && (
                        <button onClick={handleAddRecord}
                            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Add Record
                        </button>
                    )}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150"
                    >
                        <Download className="w-4 h-4" />
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
                    <p className="text-2xl font-bold text-gray-900">{parentData.length}</p>
                    <p className="text-sm text-gray-500">Total Students</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
                    <p className="text-sm text-gray-500">Showing (after search)</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, HNO, parent name, or contact..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10">S.No</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">HNO</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student Name</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student Contact</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Name(s)</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Contact 1</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Contact 2</th>
                            {setParentDataOverrides && (
                                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found.</td>
                            </tr>
                        ) : (
                            filtered.map((s, idx) => (
                                <tr key={s.hno} className="hover:bg-indigo-50/40 transition-colors">
                                    <td className="px-3 py-3 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-3 py-3 font-mono text-gray-600 text-xs whitespace-nowrap">{s.hno}</td>
                                    <td className="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.stContact} />
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 text-xs max-w-[220px]">{s.parentNames}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.p1} />
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.p2} />
                                    </td>
                                    {setParentDataOverrides && (
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => setEditingRecord(s)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                {directAccess && parentDataOverrides[s.hno] && (
                                                    <button
                                                        onClick={() => handleDelete(s.hno)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                                                        title="Remove Overrides"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> of {parentData.length} students.
            </p>
        </div>
    );
};
