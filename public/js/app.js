// ============================================================================
// 1. REAL ARCHITECTURAL LAYOUT & ROOM DATABASE (MOPH MUKDAHAN)
// ============================================================================
const BUILDINGS_META = {
    '2F': {
        id: '2F',
        name: 'อาคาร 1 (ตึกหน้า 2 ชั้น สีฟ้า)',
        shortName: 'ตึกหน้า 2 ชั้น (2F)',
        floors: 2,
        centerX: -1.5,
        centerZ: 8.5,
        width: 24.0,
        depth: 9.5,
        rotY: 0,
        color: 0x0284c7
    },
    '4F': {
        id: '4F',
        name: 'อาคาร 2 (ตึกหลัง 4 ชั้น สีขาว-เขียว & OSSC)',
        shortName: 'ตึกหลัง 4 ชั้น (4F)',
        floors: 4,
        centerX: -3.2,
        centerZ: -8.2,
        width: 26.0,
        depth: 10.5,
        rotY: 0,
        color: 0x10b981
    },
    'TTM': {
        id: 'TTM',
        name: 'คลินิกบริการแพทย์แผนไทย @ สสจ.มุกดาหาร',
        shortName: 'คลินิกแพทย์แผนไทย',
        floors: 1,
        centerX: 19.2,
        centerZ: -13.5,
        width: 11.0,
        depth: 6.5,
        rotY: -0.32,
        color: 0x2563eb
    }
};

let ROOMS_DB = [
    // --- ตึกหน้า 2 ชั้น (2F) ชั้น 1 ---
    { id: 'R211', building: '2F', floor: 1, roomNo: '211', name: 'จุดประชาสัมพันธ์ & รับ-ส่งหนังสือราชการ', head: 'งานสารบรรณกลาง', phone: 'ต่อ 101', type: 'service', lx: -7.5, lz: 0, w: 6.8, d: 6.8, desc: 'จุดสอบถามข้อมูลผู้มาติดต่อราชการ รับเรื่องร้องเรียน และงานสารบรรณกลาง ตึกหน้าชั้น 1' },
    { id: 'R212', building: '2F', floor: 1, roomNo: '212', name: 'กลุ่มงานบริหารทั่วไป (การเงินและบัญชี)', head: 'หัวหน้ากลุ่มงานบริหารทั่วไป', phone: 'ต่อ 102', type: 'admin', lx: 0.0, lz: 0, w: 6.8, d: 6.8, desc: 'งานการเงิน การบัญชี เบิกจ่ายงบประมาณ และค่าตอบแทนบุคลากร' },
    { id: 'R213', building: '2F', floor: 1, roomNo: '213', name: 'งานพัสดุและบริหารสินทรัพย์', head: 'งานพัสดุกลาง', phone: 'ต่อ 103', type: 'admin', lx: 7.5, lz: 0, w: 6.8, d: 6.8, desc: 'งานจัดซื้อจัดจ้าง ครุภัณฑ์ และดูแลอาคารสถานที่' },

    // --- ตึกหน้า 2 ชั้น (2F) ชั้น 2 (เชื่อมสะพานทางเชื่อมชั้น 2) ---
    { id: 'R221', building: '2F', floor: 2, roomNo: '221', name: 'กลุ่มงานสุขศึกษาและประชาสัมพันธ์', head: 'หัวหน้ากลุ่มงานสุขศึกษาฯ', phone: 'ต่อ 121', type: 'academic', lx: -7.5, lz: 0, w: 6.8, d: 6.8, desc: 'สื่อสารประชาสัมพันธ์ข้อมูลข่าวสารสุขภาพ และงานมวลชนสัมพันธ์' },
    { id: 'R222', building: '2F', floor: 2, roomNo: '222', name: 'กลุ่มงานนิติการ (กฎหมายสาธารณสุข)', head: 'นิติกรชำนาญการ', phone: 'ต่อ 122', type: 'admin', lx: 0.0, lz: 0, w: 6.8, d: 6.8, desc: 'งานกฎหมายสาธารณสุข คำสั่งทางปกครอง และโถงทางเชื่อมไปตึก 4 ชั้น' },
    { id: 'R223', building: '2F', floor: 2, roomNo: '223', name: 'ห้องประชุม TO BE NUMBER ONE & ตรวจสอบภายใน', head: 'ศูนย์เพื่อนใจ TO BE NUMBER ONE', phone: 'ต่อ 123', type: 'meeting', lx: 7.5, lz: 0, w: 6.8, d: 6.8, desc: 'ห้องประชุมโครงการทูบีนัมเบอร์วัน และหน่วยตรวจสอบภายใน' },

    // --- ตึกหลัง 4 ชั้น (4F) ชั้น 1 (ฝั่งซ้ายใต้ถุนโล่งจอดรถตู้ / ฝั่งขวา OSSC & ประกันสุขภาพ) ---
    { id: 'R411', building: '4F', floor: 1, roomNo: 'OSSC-1', name: 'ศูนย์บริการผลิตภัณฑ์สุขภาพเบ็ดเสร็จ (OSSC สสจ.มห)', head: 'กลุ่มงานคุ้มครองผู้บริโภคและเภสัชสาธารณสุข', phone: 'ต่อ 201', type: 'service', lx: 9.2, lz: -1.2, w: 5.8, d: 6.2, desc: 'One Stop Service Center ขออนุญาตผลิตภัณฑ์สุขภาพ อย. ร้านยา คลินิก สถานประกอบการเพื่อสุขภาพ (มีประตูทางเข้าด้านหลังพร้อมกันสาดขาว)' },
    { id: 'R412', building: '4F', floor: 1, roomNo: '412', name: 'กลุ่มงานประกันสุขภาพ & ทันตสาธารณสุข', head: 'หัวหน้ากลุ่มงานประกันสุขภาพ', phone: 'ต่อ 202', type: 'service', lx: 4.5, lz: 1.2, w: 4.5, d: 6.2, desc: 'งานสิทธิหลักประกันสุขภาพแห่งชาติ (บัตรทอง 30 บาท) และงานทันตสาธารณสุข (ประตูบานเกล็ดขาวข้างบันไดไม้)' },

    // --- ตึกหลัง 4 ชั้น (4F) ชั้น 2 (รับทางเชื่อมจากตึก 2F) ---
    { id: 'R421', building: '4F', floor: 2, roomNo: '421', name: 'กลุ่มงานส่งเสริมสุขภาพ (แม่และเด็ก/ผู้สูงอายุ)', head: 'หัวหน้ากลุ่มงานส่งเสริมสุขภาพ', phone: 'ต่อ 221', type: 'academic', lx: -7.5, lz: 0, w: 7.2, d: 7.2, desc: 'งานอนามัยแม่และเด็ก วัยเรียน วัยทำงาน และคลินิกผู้สูงอายุ (ติดโถงทางเชื่อมชั้น 2)' },
    { id: 'R422', building: '4F', floor: 2, roomNo: '422', name: 'กลุ่มงานควบคุมโรคติดต่อ & ระบาดวิทยา', head: 'หัวหน้ากลุ่มงานควบคุมโรคติดต่อ', phone: 'ต่อ 222', type: 'academic', lx: 0.5, lz: 0, w: 7.2, d: 7.2, desc: 'เฝ้าระวังป้องกันและควบคุมโรคติดต่อ โรคอุบัติใหม่ และงานระบาดวิทยา' },
    { id: 'R423', building: '4F', floor: 2, roomNo: '423', name: 'กลุ่มงานควบคุมโรคไม่ติดต่อ สุขภาพจิตและยาเสพติด (NCDs)', head: 'หัวหน้ากลุ่มงาน NCDs', phone: 'ต่อ 223', type: 'academic', lx: 8.2, lz: 0, w: 6.8, d: 7.2, desc: 'งานป้องกันควบคุมโรคเบาหวาน ความดันโลหิตสูง สุขภาพจิต และบำบัดยาเสพติด' },

    // --- ตึกหลัง 4 ชั้น (4F) ชั้น 3 (ชั้นผู้บริหาร & ยุทธศาสตร์) ---
    { id: 'R431', building: '4F', floor: 3, roomNo: '431', name: 'ห้องทำงานนายแพทย์สาธารณสุขจังหวัดมุกดาหาร', head: 'นพ.ณรงค์ จันทร์แก้ว (นพ.สสจ.มุกดาหาร)', phone: 'ต่อ 301', type: 'executive', lx: -8.0, lz: 0, w: 6.5, d: 7.2, desc: 'ห้องปฏิบัติราชการ นายแพทย์สาธารณสุขจังหวัดมุกดาหาร' },
    { id: 'R432', building: '4F', floor: 3, roomNo: '432', name: 'สำนักงานเลขานุการผู้บริหาร & ห้องรอง นพ.สสจ.', head: 'หัวหน้าสำนักงานเลขานุการ', phone: 'ต่อ 302', type: 'executive', lx: -1.0, lz: 0, w: 6.2, d: 7.2, desc: 'หน้าห้องผู้บริหาร ประสานงานวาระผู้บริหาร และห้องทำงานรองนายแพทย์สาธารณสุขจังหวัด' },
    { id: 'R433', building: '4F', floor: 3, roomNo: '433', name: 'กลุ่มงานพัฒนายุทธศาสตร์ & ทรัพยากรบุคคล (HR)', head: 'หัวหน้ากลุ่มงานพัฒนายุทธศาสตร์ฯ', phone: 'ต่อ 303', type: 'admin', lx: 5.5, lz: 0, w: 5.5, d: 7.2, desc: 'งานแผนงานยุทธศาสตร์สาธารณสุขจังหวัด และการบริหารงานบุคคล (HR)' },
    { id: 'R434', building: '4F', floor: 3, roomNo: '434', name: 'กลุ่มงานพัฒนาคุณภาพและรูปแบบบริการ (พรส.)', head: 'หัวหน้ากลุ่มงาน พรส.', phone: 'ต่อ 304', type: 'academic', lx: 10.5, lz: 0, w: 3.8, d: 7.2, desc: 'งานพัฒนาคุณภาพบริการ รพ.สต. และมาตรฐานระบบบริการสุขภาพ' },

    // --- ตึกหลัง 4 ชั้น (4F) ชั้น 4 (สุขภาพดิจิทัล Proxmox & ห้องประชุมใหญ่) ---
    { id: 'R441', building: '4F', floor: 4, roomNo: '441', name: 'กลุ่มงานสุขภาพดิจิทัล', head: 'หัวหน้ากลุ่มงานสุขภาพดิจิทัล', phone: 'ต่อ 401', type: 'digital', lx: -7.5, lz: 0, w: 7.5, d: 7.2, desc: 'งานระบบสารสนเทศและข้อมูลสุขภาพ (HDC) ให้คำปรึกษาด้านเทคโนโลยีสารสนเทศแก่หน่วยบริการ' },
    { id: 'R442', building: '4F', floor: 4, roomNo: '442', name: 'กลุ่มงานอนามัยสิ่งแวดล้อมและอาชีวอนามัย', head: 'หัวหน้ากลุ่มงานอนามัยสิ่งแวดล้อมฯ', phone: 'ต่อ 402', type: 'academic', lx: 0.5, lz: 0, w: 6.5, d: 7.2, desc: 'งานสุขาภิบาลอาหารและน้ำ ขยะติดเชื้อ และอาชีวอนามัย' },
    { id: 'R443', building: '4F', floor: 4, roomNo: '443', name: 'ห้องประชุมใหญ่ ชั้น 4 (ห้องประชุมพญามุกดาหาร)', head: 'ความจุ 150 ที่นั่ง', phone: 'ต่อ 403', type: 'meeting', lx: 8.2, lz: 0, w: 7.2, d: 7.2, desc: 'ห้องประชุมใหญ่ประจำสำนักงานสาธารณสุขจังหวัดมุกดาหาร พร้อมระบบ Video Conference' },

    // --- คลินิกบริการแพทย์แผนไทย (TTM) ---
    { id: 'RTTM1', building: 'TTM', floor: 1, roomNo: 'TTM-1', name: 'คลินิกบริการแพทย์แผนไทย @ สสจ.มุกดาหาร', head: 'กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก', phone: 'ต่อ 501', type: 'service', lx: 0.0, lz: 0, w: 9.2, d: 5.0, desc: 'บริการตรวจรักษา นวดเพื่อสุขภาพ ประคบสมุนไพร อบไอน้ำสมุนไพร และจ่ายยาสมุนไพร (ติดทางออกด้านหลัง ถนนชาภูบาล)' }
];

const REAL_PHOTO_SPOTS = [
    {
        id: 0,
        title: '📸 1. โฉมหน้าตึก 4 ชั้น (4F) • ระแนงบังแดด • แอร์เรียงตามคาน • ใต้ถุนจอดรถตู้',
        img: 'assets/20854.jpg',
        desc: 'มุมมองด้านทิศเหนือของตึก 4 ชั้น เห็นระแนงเหล็กบังแดดแนวนอนทุกชั้น คอมเพรสเซอร์แอร์วางบนคานยื่น โครงระแนงเหล็กดาดฟ้า (OSSC) และใต้ถุนชั้น 1 โล่งจอดรถตู้ สสจ.มุกดาหาร',
        pinPos: new THREE.Vector3(-4.5, 2.8, -16.2),
        cam: { radius: 22, theta: 3.05, phi: 1.22, targetX: -3.5, targetY: 6.8, targetZ: -8.0 }
    },
    {
        id: 1,
        title: '📸 2. ประตูรั้วเสาปูนหัวโค้ง • ป้าย OSSC สสจ.มห ← • ป้ายหมวกนิรภัย 100%',
        img: 'assets/20863.jpg',
        desc: 'ประตูทางเข้า-ออกด้านหลัง มีเสารั้วปูนสีอิฐหัวโค้งมน ป้ายสีน้ำเงิน "OSSC สสจ.มห ←" และป้ายพื้นที่สวมหมวกนิรภัย/คาดเข็มขัดนิรภัย 100%',
        pinPos: new THREE.Vector3(-10.5, 2.8, -16.5),
        cam: { radius: 16, theta: 3.10, phi: 1.20, targetX: -9.5, targetY: 4.5, targetZ: -11.5 }
    },
    {
        id: 2,
        title: '📸 3. ซุ้ม OSSC ครีบเหล็ก 4 ชั้น • ผนังทึบข้างตึก • รั้วไวนิล "ดื่มไม่ขับ"',
        img: 'assets/20855.jpg',
        desc: 'มุมเฉียงฝั่งตะวันออกเฉียงเหนือ เห็นผนังปูนทึบ 4 ชั้น โซน OSSC ที่มีครีบเหล็กสีเทาเข้มและระแนงดาดฟ้า กันสาดคอนกรีตยื่นชั้น 1 และป้ายไวนิล "ดื่มไม่ขับ"',
        pinPos: new THREE.Vector3(6.5, 2.8, -17.5),
        cam: { radius: 24, theta: 2.52, phi: 1.22, targetX: 2.5, targetY: 6.8, targetZ: -9.5 }
    },
    {
        id: 3,
        title: '📸 4. ทางเชื่อมชั้น 2 • ป้ายจราจรคู่ [↱ / ↑] • รางระบายน้ำ • กรวยส้มหน้าบันไดไม้',
        img: 'assets/20847.jpg',
        desc: 'ช่องทางเดินรถกลางระหว่างตึกฟ้า (ซ้าย) และตึก 4 ชั้น (ขวา) เสาทางเชื่อมติดป้ายบังคับเลี้ยวขวาและตรงไป พื้นมีรางระบายน้ำตะแกรงเหล็ก และกรวยส้มข้างบันไดไม้ประตูขาว',
        pinPos: new THREE.Vector3(-5.5, 2.5, 0.2),
        cam: { radius: 21, theta: -1.35, phi: 1.24, targetX: 0.5, targetY: 4.8, targetZ: -0.5 }
    },
    {
        id: 4,
        title: '📸 5. เสาเขียวสูง 4 ชั้นฝั่งใต้ • กระถางต้นบอนกระดาษ • รถกระบะจอดใต้ถุน',
        img: 'assets/20858.jpg',
        desc: 'มุมมองย้อนจากฝั่งตะวันออกผ่านช่องกลางตึก เห็นเสาโครงสร้างสีเขียวตั้งยาวถึงชั้น 4 กระถางต้นไม้ใบใหญ่เรียงรายตามโคนเสา และรถจอดใต้ถุน',
        pinPos: new THREE.Vector3(8.5, 2.5, -1.2),
        cam: { radius: 20, theta: 1.38, phi: 1.22, targetX: -2.0, targetY: 5.5, targetZ: -2.2 }
    },
    {
        id: 5,
        title: '📸 6. ทางวิ่งออกประตูหลัง • เส้นจอดรถสีเหลือง • ขอบเหลือง-ดำ • ป้ายรวิญศิริ mini mall',
        img: 'assets/20846.jpg',
        desc: 'ทางวิ่งฝั่งตะวันออกมุ่งหน้าออกถนนชาภูบาล พื้นปูนตีเส้นช่องจอดรถสีเหลือง ขวาเป็นฟุตบาทเหลือง-ดำพร้อมกระถางล้อยาง มองตรงไปเห็นป้าย "รวิญศิริ mini mall"',
        pinPos: new THREE.Vector3(11.8, 2.5, -10.5),
        cam: { radius: 22, theta: 0.04, phi: 1.22, targetX: 11.8, targetY: 3.5, targetZ: -22.0 }
    },
    {
        id: 6,
        title: '📸 7. ด้านข้างตึก 4 ชั้น • หน้าต่างบานกระทุ้ง 3 ช่อง • ประตูบานเกล็ดขาว',
        img: 'assets/20261109_163722.jpg',
        desc: 'ตัวอาคาร 4 ชั้นทาสีขาวอมเขียวตัดขอบเสา-คานสีเขียวมีน หน้าต่างบานกระทุ้งเรียง 3 ช่อง ชั้น 1 มีประตูบานเกล็ดสีขาวพร้อมบันไดไม้',
        pinPos: new THREE.Vector3(3.5, 2.5, 0.5),
        cam: { radius: 24, theta: 0.12, phi: 1.20, targetX: 2.5, targetY: 6.2, targetZ: -7.5 }
    },
    {
        id: 7,
        title: '📸 8. คลินิกบริการแพทย์แผนไทย @ สสจ.มุกดาหาร (ใกล้ทางออกหลัง)',
        img: 'assets/20261109_163704.jpg',
        desc: 'หลังคาเมทัลชีทโค้งสีน้ำเงินสด ฉากระแนงไม้สีน้ำตาลติดป้าย "@ สสจ.มุกดาหาร" เสาลายฉลุสีเหลืองคู่ ราวเหล็กสีน้ำเงิน และม้านั่งหินอ่อนขาว',
        pinPos: new THREE.Vector3(16.5, 2.5, -8.5),
        cam: { radius: 21, theta: -0.42, phi: 1.24, targetX: 19.0, targetY: 2.4, targetZ: -13.5 }
    },
    {
        id: 8,
        title: '📸 9. โฉมหน้าตึก 1 (ตึกหน้า 2 ชั้น สีฟ้า) & ซุ้มมุขทางเข้าหลัก',
        img: 'assets/f122.jpg',
        desc: 'หน้าตึก 2 ชั้นสีฟ้าสด ป้ายชื่อสำนักงานสีน้ำเงินยาวตลอดแนวชั้น 2 ตรากระทรวงสาธารณสุข พระบรมฉายาลักษณ์ ซุ้มมุขหน้าจั่วทางเข้า และสวนหย่อมเสาธงชาติ',
        pinPos: new THREE.Vector3(-2.0, 2.5, 12.5),
        cam: { radius: 26, theta: 0.05, phi: 1.25, targetX: -2.0, targetY: 3.2, targetZ: 7.5 }
    },
    {
        id: 9,
        title: '📸 10. หอพระพุทธรูปประจำ สสจ. & ลานจอดรถตึกหน้า',
        img: 'assets/f12.jpg',
        desc: 'หอพระพุทธรูปยอดมณฑปสีทอง ฐานปูนสีฟ้า 3 ชั้น ลานจอดรถตึกหน้าตีเส้นสีเหลือง และปีกอาคารทิศตะวันตกที่มีกันสาดลูกฟูกโค้งพร้อมสลิงดึง',
        pinPos: new THREE.Vector3(-14.5, 2.5, 9.5),
        cam: { radius: 25, theta: -0.42, phi: 1.22, targetX: -10.5, targetY: 3.0, targetZ: 8.5 }
    },
    {
        id: 10,
        title: '📸 11. ปีกอาคารตึก 1 & ม้านั่งสวนหย่อม',
        img: 'assets/f1.jpg',
        desc: 'มุมมองด้านหน้าทางเข้าตึก 1 ม้านั่งเหล็กดัดสีขาวบนลานอิฐ ทางลาดขึ้นอาคาร กันสาดลูกฟูกสีเงิน และพระบรมฉายาลักษณ์บนผนังชั้น 2',
        pinPos: new THREE.Vector3(-5.5, 2.2, 13.5),
        cam: { radius: 22, theta: 0.18, phi: 1.24, targetX: -4.5, targetY: 3.2, targetZ: 8.5 }
    }
];

const TYPE_COLORS = {
    executive: 0xf59e0b,
    service:   0x10b981,
    academic:  0x0ea5e9,
    admin:     0x8b5cf6,
    digital:   0xec4899,
    meeting:   0x14b8a6
};

// ============================================================================
// 2. THREE.JS SCENE GLOBALS & PROCEDURAL TEXTURES
// ============================================================================
let scene, camera, renderer, raycaster, mouse;
let buildingGroups = {};
let floorGroups = { '2F': {}, '4F': {}, 'FDA': {}, 'TTM': {} };
let exteriorShells = [];
let roofGroups = {};
let roomMeshes = [];
let roomMeshMap = {};
let skybridgeGroup = null;
let wayfindingGroup = null;
let satellitePlane = null;
let skyDomeMesh = null;
let trafficArrowMeshes = [];
let htmlPins = [];

const BASE_FLOOR_HEIGHT = 3.6;
let currentFloorFilter = 'ALL';
let currentBuildingFilter = 'ALL';
let currentExteriorMode = 'realistic';
let explodeFactor = 0;
let selectedRoomId = 'R431';
let isDaylightSky = true;

// Smooth Spherical Orbit Camera State
let camState = {
    radius: 44,
    theta: 0.48,
    phi: 1.05,
    target: new THREE.Vector3(0, 3.2, -2.5)
};
let camTargetState = {
    radius: 44,
    theta: 0.48,
    phi: 1.05,
    target: new THREE.Vector3(0, 3.2, -2.5)
};
let isDragging = false;
let dragButton = 0;
let prevMouse = { x: 0, y: 0 };

const REAL_TEXTURES = {};

function buildProceduralRealTextures() {
    // 1. Weathered East Concrete Shear Wall (`20261109_163723.jpg` & `20855.jpg`)
    const eastCanvas = document.createElement('canvas');
    eastCanvas.width = 512; eastCanvas.height = 512;
    const ectx = eastCanvas.getContext('2d');
    ectx.fillStyle = '#cbbab2';
    ectx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 600; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 10 + Math.random() * 35;
        ectx.fillStyle = Math.random() > 0.5 ? 'rgba(95, 82, 76, 0.08)' : 'rgba(235, 225, 220, 0.06)';
        ectx.beginPath(); ectx.arc(x, y, r, 0, Math.PI * 2); ectx.fill();
    }
    // Dark weathering streaks at top parapet
    const topGrad = ectx.createLinearGradient(0, 0, 0, 140);
    topGrad.addColorStop(0, 'rgba(55, 48, 44, 0.65)');
    topGrad.addColorStop(1, 'rgba(55, 48, 44, 0.0)');
    ectx.fillStyle = topGrad;
    ectx.fillRect(0, 0, 512, 140);
    REAL_TEXTURES.weatheredEastWall = new THREE.CanvasTexture(eastCanvas);

    // 2. Corrugated Silver Metal Roof (`หลังคาเมทัลชีทสีเงิน`)
    const silverCanvas = document.createElement('canvas');
    silverCanvas.width = 256; silverCanvas.height = 256;
    const sctx = silverCanvas.getContext('2d');
    for (let x = 0; x < 256; x += 8) {
        sctx.fillStyle = x % 16 === 0 ? '#cbd5e1' : '#94a3b8';
        sctx.fillRect(x, 0, 8, 256);
    }
    REAL_TEXTURES.silverMetalRoof = new THREE.CanvasTexture(silverCanvas);

    // 3. Corrugated Royal Blue Metal Roof (`20261109_163704.jpg`)
    const blueCanvas = document.createElement('canvas');
    blueCanvas.width = 256; blueCanvas.height = 256;
    const bctx = blueCanvas.getContext('2d');
    for (let x = 0; x < 256; x += 8) {
        bctx.fillStyle = x % 16 === 0 ? '#1d4ed8' : '#1e40af';
        bctx.fillRect(x, 0, 8, 256);
    }
    REAL_TEXTURES.blueMetalRoof = new THREE.CanvasTexture(blueCanvas);

    // 4. White Louvered Door (`ประตูบานเกล็ดขาว` in `20261109_163722.jpg` & `20847.jpg`)
    const doorCanvas = document.createElement('canvas');
    doorCanvas.width = 256; doorCanvas.height = 512;
    const dctx = doorCanvas.getContext('2d');
    dctx.fillStyle = '#f8fafc';
    dctx.fillRect(0, 0, 256, 512);
    dctx.strokeStyle = '#cbd5e1';
    dctx.lineWidth = 10;
    dctx.strokeRect(8, 8, 240, 496);
    // Top transom glass
    dctx.fillStyle = '#1e293b';
    dctx.fillRect(28, 28, 200, 95);
    // Louver slats
    dctx.fillStyle = '#94a3b8';
    for (let y = 150; y < 480; y += 12) {
        dctx.fillRect(32, y, 192, 5);
    }
    REAL_TEXTURES.whiteLouverDoor = new THREE.CanvasTexture(doorCanvas);

    // 5. Thai Traditional Medicine Wood Sign (`คลินิกบริการแพทย์แผนไทย @ สสจ.มุกดาหาร` in `20261109_163704.jpg`)
    const ttmCanvas = document.createElement('canvas');
    ttmCanvas.width = 512; ttmCanvas.height = 384;
    const tctx = ttmCanvas.getContext('2d');
    tctx.fillStyle = '#451a03';
    tctx.fillRect(0, 0, 512, 384);
    for (let y = 8; y < 384; y += 22) {
        tctx.fillStyle = '#9a6b47';
        tctx.fillRect(0, y, 512, 15);
    }
    tctx.textAlign = 'center';
    tctx.font = 'bold 34px "Prompt", sans-serif';
    tctx.strokeStyle = '#ffffff'; tctx.lineWidth = 6;
    tctx.strokeText('คลินิกบริการแพทย์แผนไทย', 256, 130);
    tctx.fillStyle = '#0284c7';
    tctx.fillText('คลินิกบริการแพทย์แผนไทย', 256, 130);
    tctx.font = 'bold 48px "Prompt", sans-serif';
    tctx.strokeText('@ สสจ.มุกดาหาร', 256, 200);
    tctx.fillStyle = '#dc2626';
    tctx.fillText('@ สสจ.มุกดาหาร', 256, 200);
    REAL_TEXTURES.ttmWoodSign = new THREE.CanvasTexture(ttmCanvas);

    // 6. Yellow Diamond Lattice Panel (`เสาลายฉลุสีเหลืองคู่` in `20261109_163704.jpg`)
    const yelCanvas = document.createElement('canvas');
    yelCanvas.width = 128; yelCanvas.height = 384;
    const yctx = yelCanvas.getContext('2d');
    yctx.fillStyle = '#eab308';
    yctx.fillRect(0, 0, 128, 384);
    yctx.strokeStyle = '#713f12';
    yctx.lineWidth = 4;
    for (let y = -128; y < 384; y += 16) {
        yctx.beginPath(); yctx.moveTo(0, y); yctx.lineTo(128, y + 128); yctx.stroke();
        yctx.beginPath(); yctx.moveTo(128, y); yctx.lineTo(0, y + 128); yctx.stroke();
    }
    REAL_TEXTURES.yellowLattice = new THREE.CanvasTexture(yelCanvas);

    // 7. AC Outdoor Compressor Unit (`คอมเพรสเซอร์แอร์` in `20854.jpg` & `20261109_163725.jpg`)
    const acCanvas = document.createElement('canvas');
    acCanvas.width = 256; acCanvas.height = 192;
    const actx = acCanvas.getContext('2d');
    actx.fillStyle = '#f1f5f9';
    actx.fillRect(0, 0, 256, 192);
    actx.fillStyle = '#1e293b';
    actx.beginPath(); actx.arc(90, 96, 64, 0, Math.PI * 2); actx.fill();
    actx.fillStyle = '#dc2626';
    actx.fillRect(195, 22, 28, 18);
    REAL_TEXTURES.acUnit = new THREE.CanvasTexture(acCanvas);

    // 8. Official Gate Signs (`OSSC สสจ.มห ←` and `หมวกนิรภัย 100%` in `20863.jpg`)
    const osscCanvas = document.createElement('canvas');
    osscCanvas.width = 512; osscCanvas.height = 256;
    const octx = osscCanvas.getContext('2d');
    octx.fillStyle = '#1e3a8a';
    octx.fillRect(0, 0, 512, 256);
    octx.strokeStyle = '#ffffff'; octx.lineWidth = 10;
    octx.strokeRect(8, 8, 496, 240);
    octx.fillStyle = '#ffffff';
    octx.font = 'bold 58px "Prompt", sans-serif';
    octx.fillText('OSSC', 90, 88);
    octx.font = 'bold 44px "Prompt", sans-serif';
    octx.fillText('สสจ.มห', 90, 145);
    octx.font = 'bold 95px sans-serif';
    octx.fillText('←', 340, 130);
    octx.fillStyle = '#ffffff';
    octx.fillRect(12, 190, 488, 54);
    octx.fillStyle = '#0f172a';
    octx.font = 'bold 26px "Prompt", sans-serif';
    octx.fillText('สำนักงานสาธารณสุขจังหวัดมุกดาหาร', 55, 226);
    REAL_TEXTURES.osscGateSign = new THREE.CanvasTexture(osscCanvas);

    const safetyCanvas = document.createElement('canvas');
    safetyCanvas.width = 512; safetyCanvas.height = 256;
    const sfctx = safetyCanvas.getContext('2d');
    sfctx.fillStyle = '#1d4ed8';
    sfctx.fillRect(0, 0, 512, 256);
    sfctx.strokeStyle = '#ffffff'; sfctx.lineWidth = 10;
    sfctx.strokeRect(8, 8, 496, 240);
    sfctx.fillStyle = '#ffffff';
    sfctx.font = 'bold 38px "Prompt", sans-serif';
    sfctx.fillText('พื้นที่สวมหมวกนิรภัย', 28, 105);
    sfctx.fillText('และคาดเข็มขัดนิรภัย', 28, 165);
    sfctx.font = 'bold 88px "Prompt", sans-serif';
    sfctx.fillText('100%', 315, 155);
    REAL_TEXTURES.safety100Sign = new THREE.CanvasTexture(safetyCanvas);

    // 9. "ดื่มไม่ขับ" Fence Banner (`20855.jpg`)
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024; bannerCanvas.height = 320;
    const bnctx = bannerCanvas.getContext('2d');
    const bGrad = bnctx.createLinearGradient(0, 0, 1024, 320);
    bGrad.addColorStop(0, '#0f172a');
    bGrad.addColorStop(0.5, '#0284c7');
    bGrad.addColorStop(1, '#1e3a8a');
    bnctx.fillStyle = bGrad;
    bnctx.fillRect(0, 0, 1024, 320);
    bnctx.font = 'bold 105px "Prompt", sans-serif';
    bnctx.strokeStyle = '#ffffff'; bnctx.lineWidth = 14;
    bnctx.strokeText('ดื่มไม่ขับ', 310, 170);
    bnctx.fillStyle = '#dc2626';
    bnctx.fillText('ดื่มไม่ขับ', 310, 170);
    bnctx.fillStyle = '#f8fafc';
    bnctx.font = 'bold 40px "Prompt", sans-serif';
    bnctx.fillText('ขับขี่ปลอดภัย ใส่ใจเพื่อนร่วมทาง สสจ.มุกดาหาร', 160, 255);
    REAL_TEXTURES.drinkDontDriveBanner = new THREE.CanvasTexture(bannerCanvas);

    // 10. "รวิญศิริ mini mall" Sign Across ถนนชาภูบาล (`20846.jpg`)
    const rawinCanvas = document.createElement('canvas');
    rawinCanvas.width = 1024; rawinCanvas.height = 320;
    const rwctx = rawinCanvas.getContext('2d');
    rwctx.fillStyle = '#f1f5f9';
    rwctx.fillRect(0, 0, 1024, 320);
    rwctx.fillStyle = '#10b981';
    rwctx.beginPath(); rwctx.ellipse(170, 150, 40, 95, -0.35, 0, Math.PI * 2); rwctx.fill();
    rwctx.fillStyle = '#059669';
    rwctx.beginPath(); rwctx.ellipse(230, 130, 42, 105, 0.1, 0, Math.PI * 2); rwctx.fill();
    rwctx.fillStyle = '#a16207';
    rwctx.font = 'bold 110px "Prompt", sans-serif';
    rwctx.fillText('รวิญศิริ', 320, 195);
    rwctx.fillStyle = '#334155';
    rwctx.font = 'bold 42px "Prompt", sans-serif';
    rwctx.fillText('RAWINSIRI mini mall', 520, 265);
    REAL_TEXTURES.rawinsiriSign = new THREE.CanvasTexture(rawinCanvas);

    // 11. Stacked Traffic Signs on Skybridge Column (`[ ↱ ]` and `[ ↑ ]` in `20847.jpg`)
    const turnSignCanvas = document.createElement('canvas');
    turnSignCanvas.width = 256; turnSignCanvas.height = 512;
    const tsctx = turnSignCanvas.getContext('2d');
    tsctx.fillStyle = '#ffffff';
    tsctx.beginPath(); tsctx.arc(128, 128, 105, 0, Math.PI * 2); tsctx.fill();
    tsctx.strokeStyle = '#0f172a'; tsctx.lineWidth = 10; tsctx.stroke();
    tsctx.fillStyle = '#0f172a';
    tsctx.font = 'bold 125px sans-serif';
    tsctx.textAlign = 'center';
    tsctx.fillText('↱', 128, 172);

    tsctx.fillStyle = '#0284c7';
    tsctx.beginPath(); tsctx.arc(128, 384, 105, 0, Math.PI * 2); tsctx.fill();
    tsctx.strokeStyle = '#ffffff'; tsctx.lineWidth = 10; tsctx.stroke();
    tsctx.fillStyle = '#ffffff';
    tsctx.fillText('↑', 128, 425);
    REAL_TEXTURES.columnTrafficSigns = new THREE.CanvasTexture(turnSignCanvas);

    // 12. South Main Entrance Monument Signboard (`สำนักงานสาธารณสุขจังหวัดมุกดาหาร`)
    const monumentCanvas = document.createElement('canvas');
    monumentCanvas.width = 1024; monumentCanvas.height = 256;
    const mctx = monumentCanvas.getContext('2d');
    mctx.fillStyle = '#0f172a';
    mctx.fillRect(0, 0, 1024, 256);
    mctx.strokeStyle = '#eab308';
    mctx.lineWidth = 10;
    mctx.strokeRect(10, 10, 1004, 236);
    mctx.fillStyle = '#facc15';
    mctx.font = 'bold 50px "Sarabun", sans-serif';
    mctx.textAlign = 'center';
    mctx.fillText('สำนักงานสาธารณสุขจังหวัดมุกดาหาร', 512, 105);
    mctx.fillStyle = '#e2e8f0';
    mctx.font = 'bold 28px sans-serif';
    mctx.fillText('MUKDAHAN PROVINCIAL PUBLIC HEALTH OFFICE', 512, 175);
    REAL_TEXTURES.mainOfficeMonument = new THREE.CanvasTexture(monumentCanvas);

    // 13. Building 1 (2F) Exterior Textures (`f1.jpg`, `f12.jpg`, `f122.jpg`)
    const texLoader = new THREE.TextureLoader();
    REAL_TEXTURES.bld1MainSign = texLoader.load('assets/bld1_main_sign.png', () => { if (typeof forceRender !== 'undefined') forceRender = true; });
    REAL_TEXTURES.bld1GableSign = texLoader.load('assets/bld1_gable_sign.png', () => { if (typeof forceRender !== 'undefined') forceRender = true; });
    REAL_TEXTURES.royalMemorial = texLoader.load('assets/royal_memorial_banner.jpg', () => { if (typeof forceRender !== 'undefined') forceRender = true; });
    REAL_TEXTURES.bld1Windows = texLoader.load('assets/bld1_ribbon_windows.png', () => { if (typeof forceRender !== 'undefined') forceRender = true; });
    REAL_TEXTURES.bld1Tobacco = texLoader.load('assets/bld1_tobacco_sign.png', () => { if (typeof forceRender !== 'undefined') forceRender = true; });

    // 14. Thai National Flag Canvas (ธงชาติตราไตรรงค์ แดง-ขาว-น้ำเงิน-ขาว-แดง สัดส่วน 1:1:2:1:1)
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 600; flagCanvas.height = 400;
    const fctx = flagCanvas.getContext('2d');
    fctx.fillStyle = '#dc2626'; // แดงบน (67px)
    fctx.fillRect(0, 0, 600, 67);
    fctx.fillStyle = '#ffffff'; // ขาว (67px)
    fctx.fillRect(0, 67, 600, 67);
    fctx.fillStyle = '#1e3a8a'; // น้ำเงินกลาง (133px)
    fctx.fillRect(0, 134, 600, 133);
    fctx.fillStyle = '#ffffff'; // ขาว (67px)
    fctx.fillRect(0, 267, 600, 67);
    fctx.fillStyle = '#dc2626'; // แดงล่าง (66px)
    fctx.fillRect(0, 334, 600, 66);
    REAL_TEXTURES.thaiFlag = new THREE.CanvasTexture(flagCanvas);

    // 15. Concrete Road Slab with Expansion Joints (ถนนคอนกรีตผิวร่องยาแนว)
    const concRoadCanvas = document.createElement('canvas');
    concRoadCanvas.width = 512; concRoadCanvas.height = 512;
    const crctx = concRoadCanvas.getContext('2d');
    crctx.fillStyle = '#94a3b8'; // Base concrete tone
    crctx.fillRect(0, 0, 512, 512);
    // Subtle concrete grain noise
    for (let i = 0; i < 6000; i++) {
        const nx = Math.random() * 512;
        const ny = Math.random() * 512;
        const colVal = Math.random() > 0.5 ? 210 : 110;
        crctx.fillStyle = `rgba(${colVal},${colVal},${colVal},0.12)`;
        crctx.fillRect(nx, ny, 2, 2);
    }
    // Dark asphalt expansion joints
    crctx.strokeStyle = '#334155';
    crctx.lineWidth = 5;
    crctx.beginPath();
    crctx.moveTo(0, 256); crctx.lineTo(512, 256);
    crctx.moveTo(256, 0); crctx.lineTo(256, 512);
    crctx.stroke();
    // Inner expansion groove highlight
    crctx.strokeStyle = 'rgba(255,255,255,0.2)';
    crctx.lineWidth = 2;
    crctx.beginPath();
    crctx.moveTo(0, 259); crctx.lineTo(512, 259);
    crctx.moveTo(259, 0); crctx.lineTo(259, 512);
    crctx.stroke();
    const concTex = new THREE.CanvasTexture(concRoadCanvas);
    concTex.wrapS = THREE.RepeatWrapping;
    concTex.wrapT = THREE.RepeatWrapping;
    REAL_TEXTURES.concreteRoad = concTex;

    // 16. Dark Asphalt Pavement Texture (ผิวถนนลาดยางมะตอย)
    const asphCanvas = document.createElement('canvas');
    asphCanvas.width = 512; asphCanvas.height = 512;
    const asctx = asphCanvas.getContext('2d');
    asctx.fillStyle = '#1e293b'; // Slate dark asphalt
    asctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
        const nx = Math.random() * 512;
        const ny = Math.random() * 512;
        const lum = Math.floor(25 + Math.random() * 45);
        asctx.fillStyle = `rgb(${lum},${lum},${lum})`;
        asctx.fillRect(nx, ny, 2, 2);
    }
    const asphTex = new THREE.CanvasTexture(asphCanvas);
    asphTex.wrapS = THREE.RepeatWrapping;
    asphTex.wrapT = THREE.RepeatWrapping;
    REAL_TEXTURES.asphaltRoad = asphTex;

    // 17. Pedestrian Crosswalk Texture (ทางม้าลายสีขาวบนแอสฟัลต์)
    const cwCanvas = document.createElement('canvas');
    cwCanvas.width = 512; cwCanvas.height = 256;
    const cwctx = cwCanvas.getContext('2d');
    cwctx.fillStyle = '#1e293b';
    cwctx.fillRect(0, 0, 512, 256);
    cwctx.fillStyle = '#f8fafc';
    for (let x = 20; x < 500; x += 60) {
        cwctx.fillRect(x, 15, 38, 226);
    }
    REAL_TEXTURES.crosswalk = new THREE.CanvasTexture(cwCanvas);

    // 18. Speed Bump Texture (ลูกระนาดชะลอความเร็ว ลายทแยงเหลือง-ดำ)
    const sbCanvas = document.createElement('canvas');
    sbCanvas.width = 256; sbCanvas.height = 64;
    const sbctx = sbCanvas.getContext('2d');
    sbctx.fillStyle = '#18181b';
    sbctx.fillRect(0, 0, 256, 64);
    sbctx.fillStyle = '#facc15';
    for (let x = -64; x < 320; x += 40) {
        sbctx.beginPath();
        sbctx.moveTo(x, 64);
        sbctx.lineTo(x + 24, 0);
        sbctx.lineTo(x + 44, 0);
        sbctx.lineTo(x + 20, 64);
        sbctx.closePath();
        sbctx.fill();
    }
    const sbTex = new THREE.CanvasTexture(sbCanvas);
    sbTex.wrapS = THREE.RepeatWrapping;
    REAL_TEXTURES.speedBump = sbTex;

    // 19. Curbs: Red-White (ขอบทางขาว-แดง ห้ามหยุด/ห้ามจอด)
    const curbRwCanvas = document.createElement('canvas');
    curbRwCanvas.width = 128; curbRwCanvas.height = 32;
    const curbRwCtx = curbRwCanvas.getContext('2d');
    curbRwCtx.fillStyle = '#dc2626'; curbRwCtx.fillRect(0, 0, 64, 32);
    curbRwCtx.fillStyle = '#f8fafc'; curbRwCtx.fillRect(64, 0, 64, 32);
    const curbRwTex = new THREE.CanvasTexture(curbRwCanvas);
    curbRwTex.wrapS = THREE.RepeatWrapping;
    curbRwTex.wrapT = THREE.RepeatWrapping;
    REAL_TEXTURES.curbRedWhite = curbRwTex;

    // 20. Stainless Steel Elevator Doors & Signage (`ลิฟต์โดยสาร ตึกหลัง 4 ชั้น`)
    const elCanvas = document.createElement('canvas');
    elCanvas.width = 512; elCanvas.height = 512;
    const elctx = elCanvas.getContext('2d');

    // Brushed stainless steel background
    const bgGrad = elctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0, '#94a3b8');
    bgGrad.addColorStop(0.25, '#cbd5e1');
    bgGrad.addColorStop(0.5, '#e2e8f0');
    bgGrad.addColorStop(0.75, '#cbd5e1');
    bgGrad.addColorStop(1, '#94a3b8');
    elctx.fillStyle = bgGrad;
    elctx.fillRect(0, 0, 512, 512);

    // Subtle brushed metal streaks
    elctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    elctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 4) {
        elctx.beginPath();
        elctx.moveTo(0, y);
        elctx.lineTo(512, y);
        elctx.stroke();
    }

    // Top architrave header band (dark smoked titanium)
    elctx.fillStyle = '#0f172a';
    elctx.fillRect(16, 16, 480, 110);
    elctx.strokeStyle = '#38bdf8';
    elctx.lineWidth = 3;
    elctx.strokeRect(18, 18, 476, 106);

    // Blue universal elevator badge
    elctx.fillStyle = '#1d4ed8';
    elctx.fillRect(32, 28, 70, 86);
    elctx.strokeStyle = '#ffffff';
    elctx.lineWidth = 2;
    elctx.strokeRect(34, 30, 66, 82);
    // Elevator pictogram
    elctx.fillStyle = '#ffffff';
    elctx.fillRect(48, 42, 38, 52);
    elctx.fillStyle = '#1d4ed8';
    elctx.fillRect(52, 46, 14, 44);
    elctx.fillRect(70, 46, 14, 44);
    elctx.fillStyle = '#ffffff';
    elctx.font = 'bold 16px sans-serif';
    elctx.fillText('▲▼', 54, 104);

    // Header text
    elctx.fillStyle = '#f8fafc';
    elctx.font = 'bold 28px "Prompt", sans-serif';
    elctx.fillText('ลิฟต์โดยสาร (PASSENGER LIFT)', 118, 62);
    elctx.fillStyle = '#38bdf8';
    elctx.font = 'bold 18px "Prompt", sans-serif';
    elctx.fillText('♿ น้ำหนักบรรทุก 1,000 กก. (13 คน)', 118, 92);

    // Digital LED floor indicator screen
    elctx.fillStyle = '#000000';
    elctx.fillRect(390, 32, 94, 78);
    elctx.strokeStyle = '#22c55e';
    elctx.lineWidth = 2;
    elctx.strokeRect(390, 32, 94, 78);
    elctx.fillStyle = '#22c55e';
    elctx.font = 'bold 36px monospace';
    elctx.fillText('▲4F', 400, 84);

    // Center door seam and outer door frame
    elctx.strokeStyle = '#334155';
    elctx.lineWidth = 6;
    elctx.strokeRect(24, 136, 464, 360);

    // Vertical center split line between the two sliding doors
    elctx.fillStyle = '#1e293b';
    elctx.fillRect(254, 136, 4, 360);
    elctx.fillStyle = '#ffffff';
    elctx.fillRect(258, 136, 1.5, 360);

    // Horizontal architectural panel seams
    elctx.strokeStyle = '#64748b';
    elctx.lineWidth = 2;
    [230, 320, 410].forEach(py => {
        elctx.beginPath();
        elctx.moveTo(30, py);
        elctx.lineTo(250, py);
        elctx.stroke();
        elctx.beginPath();
        elctx.moveTo(262, py);
        elctx.lineTo(482, py);
        elctx.stroke();
    });

    // Stainless steel safety kickplate along bottom
    elctx.fillStyle = '#64748b';
    elctx.fillRect(28, 470, 222, 22);
    elctx.fillRect(262, 470, 222, 22);

    REAL_TEXTURES.elevatorDoors = new THREE.CanvasTexture(elCanvas);

    // 21. Yellow-Black Safety Hazard Stripes for Piloti Column Bases
    const hzCanvas = document.createElement('canvas');
    hzCanvas.width = 256; hzCanvas.height = 256;
    const hzctx = hzCanvas.getContext('2d');
    hzctx.fillStyle = '#eab308';
    hzctx.fillRect(0, 0, 256, 256);
    hzctx.fillStyle = '#0f172a';
    hzctx.beginPath();
    for (let x = -256; x < 512; x += 48) {
        hzctx.moveTo(x, 0);
        hzctx.lineTo(x + 24, 0);
        hzctx.lineTo(x + 24 + 256, 256);
        hzctx.lineTo(x + 256, 256);
        hzctx.closePath();
    }
    hzctx.fill();
    REAL_TEXTURES.hazardStripes = new THREE.CanvasTexture(hzCanvas);
    REAL_TEXTURES.hazardStripes.wrapS = THREE.RepeatWrapping;
    REAL_TEXTURES.hazardStripes.wrapT = THREE.RepeatWrapping;

    // 22. OSSC Main Entrance Banner (`ศูนย์บริการแบบเบ็ดเสร็จ One Stop Service Center`)
    const obCanvas = document.createElement('canvas');
    obCanvas.width = 512; obCanvas.height = 128;
    const obctx = obCanvas.getContext('2d');
    const oGrad = obctx.createLinearGradient(0, 0, 512, 128);
    oGrad.addColorStop(0, '#0369a1');
    oGrad.addColorStop(1, '#0d9488');
    obctx.fillStyle = oGrad;
    obctx.fillRect(0, 0, 512, 128);
    obctx.strokeStyle = '#ffffff';
    obctx.lineWidth = 6;
    obctx.strokeRect(4, 4, 504, 120);

    obctx.fillStyle = '#ffffff';
    obctx.font = 'bold 30px "Prompt", sans-serif';
    obctx.fillText('ศูนย์บริการแบบเบ็ดเสร็จ (OSSC)', 40, 52);
    obctx.fillStyle = '#facc15';
    obctx.font = 'bold 20px "Prompt", sans-serif';
    obctx.fillText('One Stop Service Center • สสจ.มุกดาหาร', 42, 85);
    obctx.fillStyle = '#e0f2fe';
    obctx.font = '16px "Prompt", sans-serif';
    obctx.fillText('ชั้น 1 อาคาร 4 ชั้น (มีลิฟต์บริการ)', 42, 110);
    REAL_TEXTURES.osscEntranceBanner = new THREE.CanvasTexture(obCanvas);
}

function createElevatorDoorAssembly(floorNum) {
    const elGroup = new THREE.Group();
    // Stainless steel elevator door panel
    const doorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.68, 2.38),
        new THREE.MeshStandardMaterial({
            map: REAL_TEXTURES.elevatorDoors,
            roughness: 0.28,
            metalness: 0.65,
            side: THREE.DoubleSide
        })
    );
    doorMesh.position.set(0, 1.20, 0.04);

    // Dark titanium / granite frame surround
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.6 });
    const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.45, 0.14), frameMat);
    jambL.position.set(-0.89, 1.22, 0.02);
    const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.45, 0.14), frameMat);
    jambR.position.set(0.89, 1.22, 0.02);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.22, 0.14), frameMat);
    lintel.position.set(0, 2.45, 0.02);

    // Call button panel on right wall with glowing blue LED
    const btnMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const btnBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.04), btnMat);
    btnBox.position.set(1.10, 1.15, 0.03);
    const btnGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, 0.02, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    btnGlow.rotation.x = Math.PI / 2;
    btnGlow.position.set(1.10, 1.15, 0.055);

    // Digital LED display badge indicating the floor
    const floorLed = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.16),
        new THREE.MeshBasicMaterial({ color: 0x090d16 })
    );
    floorLed.position.set(0, 2.45, 0.10);

    // Stainless steel fluted floor sill
    const sill = new THREE.Mesh(
        new THREE.BoxGeometry(1.72, 0.05, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.25 })
    );
    sill.position.set(0, 0.025, 0.06);

    elGroup.add(doorMesh, jambL, jambR, lintel, btnBox, btnGlow, floorLed, sill);
    return elGroup;
}

// ============================================================================
// 3. INITIALIZE 3D SCENE, SKY DOME, BUILDINGS & REAL EXTERIOR DETAILS
// ============================================================================
function init3DScene() {
    const container = document.getElementById('canvas-container');
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    buildProceduralRealTextures();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x60a5fa);

    camera = new THREE.PerspectiveCamera(44, w / h, 0.5, 450);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Natural Daylight & Shadows
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.85);
    hemiLight.position.set(0, 65, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.25);
    sunLight.position.set(35, 55, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 160;
    const d = 45;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    createAfternoonSkyDome();
    buildCompoundEnvironment();
    buildAllBuildings3D();
    buildSkybridge2Fto4F();
    buildHTMLPins();
    setupMouseTouchControls();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();          // allow the browser to restore the context
        glContextLost = true;
    });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
        glContextLost = false;
        requestRender();
    });
    requestRender();
}

function createAfternoonSkyDome() {
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512; skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#1d4ed8');
    grad.addColorStop(0.45, '#60a5fa');
    grad.addColorStop(0.85, '#cbd5e1');
    grad.addColorStop(1.0, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Soft cumulus clouds
    for (let i = 0; i < 65; i++) {
        const cx = Math.random() * 512;
        const cy = 50 + Math.random() * 120;
        const r = 18 + Math.random() * 42;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyDomeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(210, 32, 20),
        new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })
    );
    scene.add(skyDomeMesh);
}

function buildCompoundEnvironment() {
    const envGroup = new THREE.Group();

    // Base Compound Ground (Neutral perimeter for horizon blend)
    const baseGround = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 150),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
    );
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.receiveShadow = true;
    envGroup.add(baseGround);

    // High-Resolution Real GIS Aerial Satellite Orthophoto Ground (`assets/satellite-4f.jpg`)
    // Calibrated directly to GPS coordinates (16.541450° N, 104.724250° E)
    const loader = new THREE.TextureLoader();
    loader.load('assets/satellite-4f.jpg', (tex) => {
        if ('colorSpace' in tex) {
            tex.colorSpace = THREE.SRGBColorSpace;
        } else if ('encoding' in tex) {
            tex.encoding = THREE.sRGBEncoding;
        }
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        satellitePlane.material.map = tex;
        satellitePlane.material.needsUpdate = true;
        if (typeof forceRender !== 'undefined') forceRender = true;
    });
    satellitePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(130, 110),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.88,
            metalness: 0.05,
            transparent: true,
            opacity: 0.96
        })
    );
    satellitePlane.rotation.x = -Math.PI / 2;
    satellitePlane.position.set(0, 0.02, 0);
    satellitePlane.receiveShadow = true;
    satellitePlane.visible = true; // Enabled by default so users immediately see real satellite terrain!
    envGroup.add(satellitePlane);

    // =========================================================================
    // REAL CAMPUS ROAD NETWORK & CIRCULATION INFRASTRUCTURE
    // Connects South Public Road -> South Main Gate -> Front Court/Parking
    // -> Skybridge Passage -> Central Courtyard -> East Driveway -> North Exit & ถนนชาภูบาล
    // =========================================================================
    const asphRoadMat = new THREE.MeshStandardMaterial({
        map: REAL_TEXTURES.asphaltRoad,
        roughness: 0.88,
        metalness: 0.05
    });
    const concRoadMat = new THREE.MeshStandardMaterial({
        map: REAL_TEXTURES.concreteRoad,
        roughness: 0.82,
        metalness: 0.08
    });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const speedBumpMat = new THREE.MeshStandardMaterial({
        map: REAL_TEXTURES.speedBump,
        roughness: 0.6
    });

    // -------------------------------------------------------------------------
    // 1. SOUTH PUBLIC ROAD (ถนนด้านหน้า - ถนนพิทักษ์พนมเขต) at Z = 33.0
    // -------------------------------------------------------------------------
    const southRoad = new THREE.Mesh(
        new THREE.BoxGeometry(96, 0.14, 8.5),
        asphRoadMat
    );
    southRoad.position.set(0, 0.07, 33.0);
    southRoad.receiveShadow = true;
    envGroup.add(southRoad);

    // Yellow Dashed Centerline on South Road
    for (let rx = -42; rx <= 42; rx += 5) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 0.22), yellowLineMat);
        dash.position.set(rx, 0.09, 33.0);
        envGroup.add(dash);
    }
    // White Solid Edge Lines on South Road
    [-3.8, 3.8].forEach(offZ => {
        const edgeLine = new THREE.Mesh(new THREE.BoxGeometry(96, 0.15, 0.18), whiteLineMat);
        edgeLine.position.set(0, 0.08, 33.0 + offZ);
        envGroup.add(edgeLine);
    });

    // -------------------------------------------------------------------------
    // 2. WEST ENTRANCE ROAD (ทางเข้าทิศใต้-ตะวันตก เข้าสู่หน้าตึก 1)
    // -------------------------------------------------------------------------
    // Paved with dark asphalt matching the outer road
    const westEntranceDrive = new THREE.Mesh(
        new THREE.BoxGeometry(7.0, 0.13, 15.0),
        asphRoadMat
    );
    westEntranceDrive.position.set(-13.5, 0.07, 25.5);
    westEntranceDrive.receiveShadow = true;
    envGroup.add(westEntranceDrive);

    // Speed Bump at West Entrance
    const westSpeedBump = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.16, 0.85), speedBumpMat);
    westSpeedBump.position.set(-13.5, 0.08, 30.5);
    envGroup.add(westSpeedBump);

    // White Solid Edge Lines on West Entrance
    [-3.3, 3.3].forEach(offX => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 14.5), whiteLineMat);
        edge.position.set(-13.5 + offX, 0.08, 25.5);
        envGroup.add(edge);
    });

    // -------------------------------------------------------------------------
    // 3. YELLOW LINE: RED-WHITE RAISED CURB ISLAND AROUND LAWN & FLAGPOLE
    // (เส้นสีเหลืองในรูป: ขอบทางขาว-แดง ล้อมรอบเกาะสนามหญ้า เสาธงชาติ และป้ายศิลา ขยับดันออกไปทางทิศใต้)
    // -------------------------------------------------------------------------
    const curbMat = new THREE.MeshStandardMaterial({
        map: REAL_TEXTURES.curbRedWhite,
        roughness: 0.6
    });
    function createCurb(x, z, length, rotY = 0) {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.24, length), curbMat);
        curb.position.set(x, 0.14, z);
        curb.rotation.y = rotY;
        curb.castShadow = true;
        envGroup.add(curb);
    }
    // West Curb (facing west entrance driveway)
    createCurb(-9.8, 25.25, 6.5, 0);
    // North Curb (running along the front driveway of Building 1)
    createCurb(-1.65, 22.0, 16.3, Math.PI / 2);
    // East Curb (facing east driveway)
    createCurb(6.5, 25.25, 6.5, 0);
    // South Curb (facing south road)
    createCurb(-1.65, 28.5, 16.3, Math.PI / 2);

    // Raised Green Lawn Bed inside the Red-White Curb Island
    const lawnBed = new THREE.Mesh(
        new THREE.BoxGeometry(16.0, 0.12, 6.2),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 })
    );
    lawnBed.position.set(-1.65, 0.08, 25.25);
    lawnBed.receiveShadow = true;
    envGroup.add(lawnBed);

    // -------------------------------------------------------------------------
    // 4. FRONT DRIVEWAY OF BUILDING 1 (ถนนลาดยางมะตอยหน้าตึก 2 ชั้น รูปแบบเหมือนถนนข้างนอก)
    // -------------------------------------------------------------------------
    // Runs cleanly between Building 1 facade/parking and the Red-White curb island
    const frontDrive = new THREE.Mesh(
        new THREE.BoxGeometry(32.0, 0.13, 7.2),
        asphRoadMat
    );
    frontDrive.position.set(-2.5, 0.07, 18.4);
    frontDrive.receiveShadow = true;
    envGroup.add(frontDrive);

    // White Solid Edge Lines on Front Driveway (รูปแบบเหมือนถนนข้างนอก)
    // North edge line (along front of building / parking apron)
    const frontNorthEdge = new THREE.Mesh(new THREE.BoxGeometry(29.0, 0.15, 0.18), whiteLineMat);
    frontNorthEdge.position.set(-4.0, 0.08, 14.9);
    envGroup.add(frontNorthEdge);

    // South edge line (along red-white curb of lawn island)
    const frontSouthEdge = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.15, 0.18), whiteLineMat);
    frontSouthEdge.position.set(-1.65, 0.08, 21.8);
    envGroup.add(frontSouthEdge);

    // Yellow Dashed Centerline on Front Driveway (รูปแบบเหมือนถนนข้างนอก)
    for (let rx = -11; rx <= 6; rx += 4.5) {
        if (Math.abs(rx - (-1.0)) < 2.0) continue; // Leave space for crosswalk
        const dash = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.20), yellowLineMat);
        dash.position.set(rx, 0.09, 18.5);
        envGroup.add(dash);
    }

    // Pedestrian Zebra Crosswalk leading from Red-White Curb Island directly to Porch Steps
    const crosswalk = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.14, 6.6),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.crosswalk })
    );
    crosswalk.position.set(-1.0, 0.08, 18.4);
    crosswalk.rotation.y = Math.PI / 2;
    envGroup.add(crosswalk);

    // -------------------------------------------------------------------------
    // 5. EAST DRIVEWAY & PARKING ("ที่รถ" / ข้างตึกเป็นลานจอดรถ ไม่มีทางทะลุออกข้างหลัง)
    // -------------------------------------------------------------------------
    // Driveway & parking running north-south along the east side of the campus
    // Ends at the north perimeter fence at Z = -19.5 (dead-end parking, no rear exit here)
    const eastDrive = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 0.13, 41.5),
        asphRoadMat
    );
    eastDrive.position.set(10.0, 0.07, 1.25);
    eastDrive.receiveShadow = true;
    envGroup.add(eastDrive);

    // Speed Bump on East Driveway
    const eastSpeedBump = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.15, 0.85), speedBumpMat);
    eastSpeedBump.position.set(10.0, 0.08, 20.5);
    envGroup.add(eastSpeedBump);

    // White Solid Edge Line on East Driveway
    const eastOuterEdge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 41.0), whiteLineMat);
    eastOuterEdge.position.set(13.3, 0.08, 1.25);
    envGroup.add(eastOuterEdge);

    // Yellow Parking Bay Lines along East Parking Lot (`20846.jpg`)
    const longYellowLine = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 18.0), yellowLineMat);
    longYellowLine.position.set(9.8, 0.09, -9.5);
    envGroup.add(longYellowLine);
    [-2.0, -6.5, -11.0, -15.5, -19.5].forEach(yz => {
        const crossLine = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.16), yellowLineMat);
        crossLine.position.set(8.2, 0.09, yz);
        envGroup.add(crossLine);
    });

    // Parked Cars in East Parking bays (`20846.jpg`)
    const blackSedan = createSimpleCarMesh(0x18181b);
    blackSedan.position.set(8.2, 0.16, -6.2);
    blackSedan.rotation.y = Math.PI / 2;
    const silverPickup = createSimpleCarMesh(0x64748b);
    silverPickup.position.set(8.2, 0.16, -11.0);
    silverPickup.rotation.y = Math.PI / 2;
    const whiteCity = createSimpleCarMesh(0xf8fafc);
    whiteCity.position.set(8.2, 0.16, -15.5);
    whiteCity.rotation.y = Math.PI / 2;
    envGroup.add(blackSedan, silverPickup, whiteCity);

    // Yellow-and-Black Curb on Right Side (`20846.jpg`)
    for (let cz = 2.0; cz >= -18.0; cz -= 1.0) {
        const isYellow = Math.abs(Math.round(cz)) % 2 === 0;
        const curb = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.26, 0.98),
            new THREE.MeshStandardMaterial({ color: isYellow ? 0xfacc15 : 0x18181b })
        );
        curb.position.set(13.6, 0.16, cz);
        envGroup.add(curb);
    }
    [-5.5, -8.5, -11.5, -14.5].forEach((tz, idx) => {
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14),
            new THREE.MeshStandardMaterial({ color: idx % 2 === 0 ? 0xbae6fd : 0xf8fafc })
        );
        tire.position.set(14.4, 0.32, tz);
        const plant = new THREE.Mesh(
            new THREE.ConeGeometry(0.45, 1.1, 7),
            new THREE.MeshStandardMaterial({ color: 0x15803d })
        );
        plant.position.set(14.4, 0.9, tz);
        envGroup.add(tire, plant);
    });

    // -------------------------------------------------------------------------
    // 6. COURTYARD DRIVEWAY UNDER SKYBRIDGE (`20847.jpg` & `20261109_163725.jpg`)
    // -------------------------------------------------------------------------
    // Driveway connecting East Driveway west under the Skybridge to the 4F Underbelly
    // ขยายถนนช่วงทางเชื่อมและลานกลางให้กว้างขวาง (depth 8.0m) รถเลี้ยวสะดวก
    const courtyardDrive = new THREE.Mesh(
        new THREE.BoxGeometry(24.0, 0.13, 8.0),
        asphRoadMat
    );
    courtyardDrive.position.set(-1.0, 0.07, 0.0);
    courtyardDrive.receiveShadow = true;
    envGroup.add(courtyardDrive);

    // Metal Drainage Trench Grate across Central Driveway (`20847.jpg`)
    const drainGrate = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.14, 7.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 })
    );
    drainGrate.position.set(-2.2, 0.08, 0.0);
    envGroup.add(drainGrate);

    // Black-and-White Painted Brick Curb Planter hugging the 2F wall base (`20847.jpg`)
    // ย้ายชิดขอบกำแพงตึก 2F เพื่อไม่ให้เกะกะหรือบีบช่องทางเดินรถตรงจุดเลี้ยวเข้าใต้ตึก
    const planterGroup = new THREE.Group();
    planterGroup.position.set(-4.5, 0.1, 3.4);
    for (let bx = -4.0; bx <= 4.0; bx += 0.8) {
        const isBlack = Math.abs(Math.round(bx)) % 2 === 0;
        const curbBlock = new THREE.Mesh(
            new THREE.BoxGeometry(0.78, 0.28, 0.6),
            new THREE.MeshStandardMaterial({ color: isBlack ? 0x1e293b : 0xf1f5f9, roughness: 0.8 })
        );
        curbBlock.position.set(bx, 0.14, 0);
        planterGroup.add(curbBlock);
    }
    for (let px = -3.5; px <= 3.5; px += 1.4) {
        const bush = new THREE.Mesh(
            new THREE.ConeGeometry(0.55, 1.8, 7),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 })
        );
        bush.position.set(px, 0.95, 0);
        planterGroup.add(bush);
    }
    envGroup.add(planterGroup);

    // Speed Bump before Skybridge
    const skybridgeSpeedBump = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.15, 7.8),
        speedBumpMat
    );
    skybridgeSpeedBump.position.set(-5.5, 0.08, 0.0);
    skybridgeSpeedBump.rotation.y = Math.PI / 2;
    envGroup.add(skybridgeSpeedBump);

    // Blue & Orange Trash Bins (`ถังขยะสีน้ำเงิน-ส้ม` in `20858.jpg`)
    const blueBin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.75, 12), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
    blueBin.position.set(2.5, 0.45, 3.4);
    const orangeBin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.68, 12), new THREE.MeshStandardMaterial({ color: 0xea580c }));
    orangeBin.position.set(3.2, 0.42, 3.4);
    envGroup.add(blueBin, orangeBin);

    // -------------------------------------------------------------------------
    // 7. DRIVE-THROUGH UNDER BUILDING 4F ("มันต้องขับผ่านใต้ตึกด้วยนะ")
    // -------------------------------------------------------------------------
    // Connects from Courtyard at X = -8.0 -> directly through 4F ground floor piloti -> out rear gate to ถนนชาภูบาล
    const under4FDrive = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.13, 26.0),
        asphRoadMat
    );
    under4FDrive.position.set(-8.0, 0.07, -12.5);
    under4FDrive.receiveShadow = true;
    envGroup.add(under4FDrive);

    // White Stop Line before entering ถนนชาภูบาล from under 4F
    const stopLineNorthWest = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.15, 0.35), whiteLineMat);
    stopLineNorthWest.position.set(-8.0, 0.08, -22.0);
    envGroup.add(stopLineNorthWest);

    // -------------------------------------------------------------------------
    // 8. NORTH ROAD - ถนนชาภูบาล (North Road at Z = -25.5) & REAR GATES
    // -------------------------------------------------------------------------
    const northRoad = new THREE.Mesh(
        new THREE.BoxGeometry(96, 0.14, 7.5),
        asphRoadMat
    );
    northRoad.position.set(0, 0.07, -25.5);
    northRoad.receiveShadow = true;
    envGroup.add(northRoad);

    // Dashed road line on ถนนชาภูบาล
    for (let rx = -42; rx <= 42; rx += 5) {
        const dash = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.16, 0.22),
            yellowLineMat
        );
        dash.position.set(rx, 0.09, -25.5);
        envGroup.add(dash);
    }

    // -------------------------------------------------------------------------
    // 9. RED PERIMETER FENCE & GATES (เส้นสีแดงในรูป: รั้วด้านทิศตะวันตกและทิศเหนือ)
    // -------------------------------------------------------------------------
    const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xb47b65, roughness: 0.75 });
    const blackSteelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.35 });

    // West Fence Line (running north-south along X = -24.5 from Z = 33.0 to Z = -22.0)
    for (let fz = 33.0; fz >= -21.0; fz -= 3.0) {
        const pGroup = new THREE.Group();
        pGroup.position.set(-24.5, 0, fz);
        const pShaft = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.85, 0.42), terracottaMat);
        pShaft.position.y = 0.92;
        const pCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 12), terracottaMat);
        pCap.rotation.z = Math.PI / 2;
        pCap.position.y = 1.88;
        pGroup.add(pShaft, pCap);
        envGroup.add(pGroup);

        const lWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 2.8), terracottaMat);
        lWall.position.set(-24.5, 0.28, fz - 1.5);
        const tRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 2.8), blackSteelMat);
        tRail.position.set(-24.5, 1.55, fz - 1.5);
        envGroup.add(lWall, tRail);
    }

    // North Fence Line (along ถนนชาภูบาล at Z = -21.8)
    // Only 1 Gate Opening: for the road emerging from under 4F (X: -11.5 to -4.5)
    // The east side is a closed perimeter fence because the east side is a dead-end parking lot (`20846.jpg`)
    for (let fx = -24.5; fx <= 24.5; fx += 2.6) {
        // Only skip gate opening for under-4F drive (ไม่มีทางออกฝั่งตะวันออก ต้องขับลอดใต้ตึกเท่านั้น)
        if (fx > -11.5 && fx < -4.5) continue;

        const pillarGroup = new THREE.Group();
        pillarGroup.position.set(fx, 0, -21.8);
        const pShaft = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.75, 0.42), terracottaMat);
        pShaft.position.y = 0.88;
        const pCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 12), terracottaMat);
        pCap.rotation.x = Math.PI / 2;
        pCap.position.y = 1.78;
        pillarGroup.add(pShaft, pCap);
        envGroup.add(pillarGroup);

        const lowWall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.48, 0.22), terracottaMat);
        lowWall.position.set(fx + 1.3, 0.24, -21.8);
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.08), blackSteelMat);
        topRail.position.set(fx + 1.3, 1.48, -21.8);
        envGroup.add(lowWall, topRail);
    }

    // "ดื่มไม่ขับ" Banner (`20855.jpg`) beside North Fence
    const bannerPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(4.4, 1.25),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.drinkDontDriveBanner, side: THREE.DoubleSide })
    );
    bannerPlane.position.set(4.5, 0.95, -21.9);
    bannerPlane.rotation.y = Math.PI;
    envGroup.add(bannerPlane);

    // Gate Signs (`OSSC สสจ.มห ←` and `หมวกนิรภัย 100%` in `20863.jpg`)
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.3, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    signPost.position.set(-12.6, 1.65, -15.65);
    const osscBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(1.75, 0.88),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.osscGateSign, side: THREE.DoubleSide })
    );
    osscBoard.position.set(-12.6, 2.85, -15.72);
    osscBoard.rotation.y = Math.PI;
    const safetyBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(1.55, 0.78),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.safety100Sign, side: THREE.DoubleSide })
    );
    safetyBoard.position.set(-12.6, 1.85, -15.72);
    safetyBoard.rotation.y = Math.PI;
    envGroup.add(signPost, osscBoard, safetyBoard);

    // 5. "รวิญศิริ mini mall" Across ถนนชาภูบาล (`20846.jpg`)
    const rawinGroup = new THREE.Group();
    rawinGroup.position.set(11.5, 0, -32.2);
    const rawinBody = new THREE.Mesh(
        new THREE.BoxGeometry(16.0, 5.2, 4.5),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    rawinBody.position.y = 2.6;
    const rawinSign = new THREE.Mesh(
        new THREE.PlaneGeometry(8.8, 2.6),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.rawinsiriSign })
    );
    rawinSign.position.set(0, 3.8, 2.3);
    rawinGroup.add(rawinBody, rawinSign);
    envGroup.add(rawinGroup);

    // 6. Front Lawn Garden, Topiary Hedges & Stainless Flagpole (`f122.jpg` & `f1.jpg`)
    // Round Topiary Hedges (ไม้ดัดพุ่มกลมตาม `f122.jpg` บนเกาะกลางเสาธง)
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const hedgePositions = [
        { x: -7.5, z: 23.5, r: 0.65 },
        { x: -5.0, z: 24.2, r: 0.75 },
        { x: 1.8,  z: 24.2, r: 0.75 },
        { x: 4.2,  z: 23.6, r: 0.70 },
        { x: -7.5, z: 27.0, r: 0.70 },
        { x: 4.2,  z: 27.0, r: 0.65 }
    ];
    hedgePositions.forEach(hp => {
        const hedge = new THREE.Mesh(new THREE.DodecahedronGeometry(hp.r, 1), hedgeMat);
        hedge.position.set(hp.x, hp.r * 0.85 + 0.08, hp.z);
        hedge.scale.set(1.15, 0.85, 1.15);
        hedge.castShadow = true;
        hedge.receiveShadow = true;
        envGroup.add(hedge);
    });

    // Tall Slender Stainless-Steel Flagpole in Lawn Island (`f122.jpg`)
    // ขยับดันออกไปตั้งเด่นสง่าใจกลางเกาะสนามหญ้า
    const flagPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.12, 11.5, 12),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.85, roughness: 0.2 })
    );
    flagPole.position.set(-1.6, 5.75, 25.2);
    flagPole.castShadow = true;
    const flagGoldBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }));
    flagGoldBall.position.set(-1.6, 11.6, 25.2);
    const thaiFlagMat = new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.thaiFlag, side: THREE.DoubleSide });
    const thaiFlag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), thaiFlagMat);
    thaiFlag.position.set(-0.4, 10.6, 25.2);
    envGroup.add(flagPole, flagGoldBall, thaiFlag);

    // 4 Flagpole Diagonal Stay Cables Anchored to Ground (`f122.jpg`)
    [-1, 1].forEach(sx => {
        [-1, 1].forEach(sz => {
            const cableGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-1.6 + sx * 2.6, 0.05, 25.2 + sz * 2.6),
                new THREE.Vector3(-1.6, 7.8, 25.2)
            ]);
            const cable = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
            envGroup.add(cable);
        });
    });

    // Tobacco-Free Policy Signboard in Front Lawn (`f122.jpg`)
    const tobaccoSignGroup = new THREE.Group();
    tobaccoSignGroup.position.set(1.5, 0, 24.5);
    const tPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    tPost1.position.set(-0.7, 0.9, 0);
    const tPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    tPost2.position.set(0.7, 0.9, 0);
    const tBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, 1.25),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.bld1Tobacco, side: THREE.DoubleSide })
    );
    tBoard.position.set(0, 1.45, 0.02);
    tobaccoSignGroup.add(tPost1, tPost2, tBoard);
    envGroup.add(tobaccoSignGroup);

    // Decorative Brick Patio & White Wrought-Iron Garden Benches (`f1.jpg`)
    const patioGroup = new THREE.Group();
    patioGroup.position.set(-6.5, 0.04, 25.5);
    const pBrick = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.06, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 })
    );
    patioGroup.add(pBrick);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.52), benchMat);
    benchSeat.position.set(0, 0.42, 0);
    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 0.05), benchMat);
    benchBack.position.set(0, 0.70, -0.23);
    [-0.75, 0.75].forEach(bx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.5), benchMat);
        leg.position.set(bx, 0.21, 0);
        patioGroup.add(leg);
    });
    patioGroup.add(benchSeat, benchBack);
    envGroup.add(patioGroup);

    // Traditional Thai Spirit House / Buddha Shrine (หอพระ / ศาลพระภูมิประจำ สสจ.) (`f12.jpg`)
    const spiritHouse = createThaiSpiritHouse();
    spiritHouse.position.set(-16.5, 0, 8.5);
    envGroup.add(spiritHouse);

    // Yellow Parking Bay Stalls in front of Building 1 (`f12.jpg` & `f1.jpg`)
    // อยู่บนลานจอดรถด้านหน้าตัวอาคาร (อยู่นอกตัวตึก ไม่ติดผนัง/ห้องภายใน)
    const yellowStallMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    [-14.0, -11.0, -8.0, -5.0].forEach(px => {
        const stallLine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 4.2), yellowStallMat);
        stallLine.position.set(px, 0.07, 15.2);
        envGroup.add(stallLine);
    });

    // Parked Cars matching `f1.jpg` & `f12.jpg` (White Yaris, White Altis, Dark Sedan, White BYD EV)
    // จอดในช่องจอดหน้าระเบียงตึกอย่างเป็นระเบียบ
    const whiteYaris = createSimpleCarMesh(0xf8fafc);
    whiteYaris.position.set(-5.0, 0.15, 15.2);
    const whiteAltis = createSimpleCarMesh(0xf1f5f9);
    whiteAltis.position.set(-8.0, 0.15, 15.2);
    const darkSedan = createSimpleCarMesh(0x1e293b);
    darkSedan.position.set(-11.0, 0.15, 15.2);
    const whiteByd = createSimpleCarMesh(0xe2e8f0);
    whiteByd.position.set(-14.0, 0.15, 15.2);
    envGroup.add(whiteYaris, whiteAltis, darkSedan, whiteByd);

    // 7. South Main Entrance Monument Signboard (`สำนักงานสาธารณสุขจังหวัดมุกดาหาร`)
    // ดันออกไปทางทิศใต้ติดแนวถนนใหญ่ด้านหน้า
    const monumentGroup = new THREE.Group();
    monumentGroup.position.set(-1.6, 0, 28.5);
    const mBase = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.5, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })
    );
    mBase.position.y = 0.25;
    mBase.castShadow = true;
    mBase.receiveShadow = true;

    const mBoard = new THREE.Mesh(
        new THREE.BoxGeometry(6.6, 1.8, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    mBoard.position.y = 1.4;
    mBoard.castShadow = true;

    const mSignFace = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 1.6),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.mainOfficeMonument, side: THREE.DoubleSide })
    );
    mSignFace.position.set(0, 1.4, 0.24);
    const mSignBack = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 1.6),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.mainOfficeMonument, side: THREE.DoubleSide })
    );
    mSignBack.position.set(0, 1.4, -0.24);
    mSignBack.rotation.y = Math.PI;

    monumentGroup.add(mBase, mBoard, mSignFace, mSignBack);
    envGroup.add(monumentGroup);

    // South Perimeter Gate Posts
    [-6.5, 3.5].forEach(gx => {
        const gatePillar = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 2.4, 0.7),
            terracottaMat
        );
        gatePillar.position.set(gx, 1.2, 28.5);
        gatePillar.castShadow = true;
        const gateCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 12, 10),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 })
        );
        gateCap.position.set(gx, 2.55, 28.5);
        envGroup.add(gatePillar, gateCap);
    });

    // 8. Campus Shade Trees (Real Tree Mesh with Layered Canopy & Shadows)
    const treePositions = [
        // North Road (ถนนชาภูบาล sidewalk)
        { x: -24.0, z: -21.5, h: 6.2, r: 2.7, c: 0x15803d },
        { x: -17.5, z: -21.5, h: 5.5, r: 2.4, c: 0x166534 },
        { x: 17.5,  z: -21.5, h: 5.6, r: 2.5, c: 0x15803d },
        { x: 24.0,  z: -21.5, h: 6.0, r: 2.8, c: 0x166534 },
        { x: 30.0,  z: -21.5, h: 5.2, r: 2.3, c: 0x15803d },
        // Courtyard & West Perimeter (ย้ายต้นไม้ออกจากถนนช่องทางเชื่อมไปไว้ริมรั้วและสวนข้างคลินิก)
        { x: -22.0, z: -6.0,  h: 5.8, r: 2.6, c: 0x166534 },
        { x: -22.0, z: 0.0,   h: 5.2, r: 2.3, c: 0x15803d },
        { x: -22.0, z: 6.0,   h: 5.4, r: 2.4, c: 0x15803d },
        { x: -18.0, z: 15.0,  h: 5.2, r: 2.3, c: 0x166534 },
        // East Parking Perimeter & Thai Traditional Medicine Clinic
        { x: 17.5,  z: 2.5,   h: 5.2, r: 2.4, c: 0x166534 },
        { x: 21.0,  z: -7.0,  h: 5.6, r: 2.5, c: 0x15803d },
        { x: 21.0,  z: 5.0,   h: 5.4, r: 2.4, c: 0x166534 },
        { x: 21.0,  z: 14.0,  h: 5.8, r: 2.6, c: 0x15803d },
        { x: 36.0,  z: -12.0, h: 5.5, r: 2.4, c: 0x166534 },
        { x: 36.0,  z: -2.0,  h: 5.2, r: 2.3, c: 0x15803d },
        // South Main Entrance Garden
        { x: -24.0, z: 22.0,  h: 5.0, r: 2.2, c: 0x15803d },
        { x: 16.0,  z: 25.0,  h: 5.2, r: 2.3, c: 0x166534 },
    ];
    treePositions.forEach(tp => {
        const tree = createCampusTree(tp.h, tp.r, tp.c);
        tree.position.set(tp.x, 0, tp.z);
        envGroup.add(tree);
    });

    scene.add(envGroup);
}

function createCampusTree(height = 5.5, canopyRadius = 2.4, color = 0x15803d) {
    const tree = new THREE.Group();
    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.36, height * 0.45, 8),
        trunkMat
    );
    trunk.position.y = height * 0.225;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Layered Foliage Canopy
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });

    const canopy1 = new THREE.Mesh(
        new THREE.DodecahedronGeometry(canopyRadius, 1),
        leavesMat1
    );
    canopy1.position.y = height * 0.65;
    canopy1.scale.set(1, 0.85, 1);
    canopy1.castShadow = true;
    tree.add(canopy1);

    const canopy2 = new THREE.Mesh(
        new THREE.DodecahedronGeometry(canopyRadius * 0.72, 1),
        leavesMat2
    );
    canopy2.position.set(0.18, height * 0.82, -0.15);
    canopy2.castShadow = true;
    tree.add(canopy2);

    return tree;
}

function createThaiSpiritHouse() {
    const group = new THREE.Group();
    const skyBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
    const whiteTileMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
    const redTrimMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });

    // Multi-tiered stepped platform base (`f12.jpg`)
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 3.6), whiteTileMat);
    base1.position.y = 0.11;
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 3.0), skyBlueMat);
    base2.position.y = 0.33;
    const base3 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 2.4), whiteTileMat);
    base3.position.y = 0.55;
    base1.castShadow = base2.castShadow = base3.castShadow = true;
    base1.receiveShadow = base2.receiveShadow = base3.receiveShadow = true;
    group.add(base1, base2, base3);

    // Front access steps
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.8), whiteTileMat);
    step.position.set(0, 0.175, 2.0);
    group.add(step);

    // 4 Corner Sky-Blue Pillars with Gold Ornaments (`f12.jpg`)
    [-0.85, 0.85].forEach(cx => {
        [-0.85, 0.85].forEach(cz => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8), skyBlueMat);
            pillar.position.set(cx, 1.55, cz);
            pillar.castShadow = true;
            const goldCapital = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldMat);
            goldCapital.position.set(cx, 2.45, cz);
            group.add(pillar, goldCapital);
        });
    });

    // Enclosed Shrine Altar Box
    const altarWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), whiteTileMat);
    altarWall.position.set(0, 1.25, 0);
    const buddha = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 8), goldMat);
    buddha.position.set(0, 1.75, 0.1);
    buddha.castShadow = true;
    group.add(altarWall, buddha);

    // Multi-Tier Golden Thai Temple Roof (หลังคามณฑปทรงจั่วซ้อน ยอดปรางค์แหลมสีทอง) (`f12.jpg`)
    const eaveDeck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), redTrimMat);
    eaveDeck.position.y = 2.48;
    group.add(eaveDeck);

    // Lower Roof Tier
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.75, 4), goldMat);
    lowerRoof.position.y = 2.9;
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.castShadow = true;

    // Upper Roof Tier
    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.65, 4), goldMat);
    upperRoof.position.y = 3.5;
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.castShadow = true;

    // Golden Spire Pinnacle (ยอดฉัตรทองแหลม)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.16, 1.3, 8), goldMat);
    spire.position.y = 4.25;
    spire.castShadow = true;

    group.add(lowerRoof, upperRoof, spire);
    return group;
}

// ============================================================================
// 4. BUILD ALL 4 BUILDINGS WITH REAL EXTERIOR SHELLS & INTERIOR ROOM BLOCKS
// ============================================================================
function buildAllBuildings3D() {
    Object.values(BUILDINGS_META).forEach(bld => {
        floorGroups[bld.id] = floorGroups[bld.id] || {};
        const bGroup = new THREE.Group();
        bGroup.position.set(bld.centerX, 0, bld.centerZ);
        bGroup.rotation.y = bld.rotY || 0;
        buildingGroups[bld.id] = bGroup;
        scene.add(bGroup);

        for (let f = 1; f <= bld.floors; f++) {
            const fGroup = new THREE.Group();
            fGroup.position.y = (f - 1) * BASE_FLOOR_HEIGHT;
            fGroup.userData = { buildingId: bld.id, floor: f };

            // Floor Slab
            const slab = new THREE.Mesh(
                new THREE.BoxGeometry(bld.width, 0.28, bld.depth),
                new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 })
            );
            slab.position.y = 0.14;
            slab.receiveShadow = true;
            fGroup.add(slab);

            // Realistic Exterior Shell for this Floor
            const shell = buildRealisticFloorExterior(bld, f);
            exteriorShells.push(shell);
            fGroup.add(shell);

            floorGroups[bld.id][f] = fGroup;
            bGroup.add(fGroup);
        }

        // Building Roof
        const roof = buildBuildingRoof(bld);
        roof.position.y = bld.floors * BASE_FLOOR_HEIGHT;
        roofGroups[bld.id] = roof;
        bGroup.add(roof);
    });

    // Populate Interior Room Blocks inside each floor group (Clamped strictly inside walls)
    ROOMS_DB.forEach(room => {
        const bld = BUILDINGS_META[room.building];
        const fGroup = floorGroups[room.building][room.floor];
        if (!bld || !fGroup) return;

        const maxW = bld.width - 1.2;
        const maxD = bld.depth - 1.2;
        const rw = Math.min(room.w, maxW);
        const rd = Math.min(room.d, maxD);
        const halfBldW = bld.width / 2 - 0.6;
        const halfBldD = bld.depth / 2 - 0.6;
        const clampedX = Math.max(-halfBldW + rw / 2, Math.min(halfBldW - rw / 2, room.lx));
        const clampedZ = Math.max(-halfBldD + rd / 2, Math.min(halfBldD - rd / 2, room.lz));

        const colHex = TYPE_COLORS[room.type] || 0x10b981;
        const rMat = new THREE.MeshStandardMaterial({
            color: colHex,
            roughness: 0.35,
            metalness: 0.15,
            transparent: true,
            opacity: 0.92
        });
        const rMesh = new THREE.Mesh(new THREE.BoxGeometry(rw, BASE_FLOOR_HEIGHT - 0.55, rd), rMat);
        rMesh.position.set(clampedX, (BASE_FLOOR_HEIGHT - 0.55) / 2 + 0.28, clampedZ);
        rMesh.userData = { roomId: room.id, roomData: room };
        rMesh.visible = false; // Hidden in realistic exterior mode by default

        fGroup.add(rMesh);
        roomMeshes.push(rMesh);
        roomMeshMap[room.id] = rMesh;
    });
}

function buildRealisticFloorExterior(bld, floor) {
    const shell = new THREE.Group();
    shell.userData = { buildingId: bld.id, floor: floor };
    const w = bld.width;
    const d = bld.depth;
    const h = BASE_FLOOR_HEIGHT;

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.85, transparent: true, opacity: 0.82 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    // ===================== 1. ตึกหลัง 4 ชั้น (4F) =====================
    if (bld.id === '4F') {
        const mintWallMat = new THREE.MeshStandardMaterial({ color: 0xe6f4ea, roughness: 0.65 });
        const sageTrimMat = new THREE.MeshStandardMaterial({ color: 0x84b58c, roughness: 0.5 });
        const weatheredConcreteMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.weatheredEastWall, roughness: 0.88 });
        const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 });
        const acBoxMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.acUnit });

        // Continuous horizontal green cornice band around perimeter
        const topBand = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.38, d + 0.18), sageTrimMat);
        topBand.position.y = h - 0.19;
        topBand.castShadow = true;
        shell.add(topBand);

        // Full-Height Solid Weathered Concrete East Shear Wall (`20261109_163723.jpg` & `20855.jpg`)
        const eastShearWall = new THREE.Mesh(new THREE.BoxGeometry(0.52, h, d + 0.22), weatheredConcreteMat);
        eastShearWall.position.set(w / 2 - 0.1, h / 2, 0);
        eastShearWall.castShadow = true;
        shell.add(eastShearWall);

        // OSSC Dark-Grey Vertical Steel Fins on North-East Corner (`20855.jpg` & `20854.jpg`)
        [9.2, 10.3, 11.4, 12.5].forEach(fx => {
            const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.65), darkSteelMat);
            vFin.position.set(fx, h / 2, -d / 2 - 0.32);
            vFin.castShadow = true;
            shell.add(vFin);
        });

        // 4-Storey Vertical Colonnade Columns along South Facade (`20858.jpg`)
        [-6.5, -2.2, 2.2, 5.8].forEach(bx => {
            const tallButtress = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.65), sageTrimMat);
            tallButtress.position.set(bx, h / 2, d / 2 + 0.22);
            tallButtress.castShadow = true;
            shell.add(tallButtress);
        });

        // ==============================================================
        // ELEVATOR CORE & SHAFT (Floors 1-4, East side at x = 9.2, z = 2.4)
        // ==============================================================
        const elCoreBox = new THREE.Mesh(new THREE.BoxGeometry(2.8, h - 0.2, 2.6), mintWallMat);
        elCoreBox.position.set(9.2, h / 2, 2.3);
        elCoreBox.castShadow = true;
        shell.add(elCoreBox);

        // Elevator Door Assembly facing South into the access corridor
        const elDoors = createElevatorDoorAssembly(floor);
        elDoors.position.set(9.2, 0, 3.62);
        shell.add(elDoors);

        // ==========================================
        // FLOOR 1 (ชั้น 1) DETAILS
        // ==========================================
        if (floor === 1) {
            // 1. Structural Piloti Columns with Hazard Warning Yellow/Black Stripes
            // Column positions: keeping drive-through lane (x = -5.0 local, world X = -8.0) clear!
            const hazardMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.hazardStripes, roughness: 0.4 });
            const colXCoords = [-12.2, -8.0, -2.2, 2.2, 5.8, 12.2];

            // South column row
            colXCoords.forEach(cx => {
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.62), hazardMat);
                base.position.set(cx, 0.425, d / 2 - 0.35);
                const colTop = new THREE.Mesh(new THREE.BoxGeometry(0.60, h - 0.85, 0.60), sageTrimMat);
                colTop.position.set(cx, 0.85 + (h - 0.85) / 2, d / 2 - 0.35);
                colTop.castShadow = true;
                shell.add(base, colTop);
            });

            // North column row
            colXCoords.forEach(cx => {
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.62), hazardMat);
                base.position.set(cx, 0.425, -d / 2 + 0.35);
                const colTop = new THREE.Mesh(new THREE.BoxGeometry(0.60, h - 0.85, 0.60), sageTrimMat);
                colTop.position.set(cx, 0.85 + (h - 0.85) / 2, -d / 2 + 0.35);
                colTop.castShadow = true;
                shell.add(base, colTop);
            });

            // Center column row (No column between x = -8.0 and -2.2 to allow clear vehicle drive-through!)
            [-12.2, 2.2, 5.8, 12.2].forEach(cx => {
                const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.62), hazardMat);
                base.position.set(cx, 0.425, 0);
                const colTop = new THREE.Mesh(new THREE.BoxGeometry(0.60, h - 0.85, 0.60), sageTrimMat);
                colTop.position.set(cx, 0.85 + (h - 0.85) / 2, 0);
                colTop.castShadow = true;
                shell.add(base, colTop);
            });

            // Ceiling Fluorescent Light Fixtures
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            [-10.2, -5.0, 0.0, 4.0].forEach(lx => {
                [-1.8, 1.8].forEach(lz => {
                    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.28), lightMat);
                    lamp.position.set(lx, h - 0.22, lz);
                    shell.add(lamp);
                });
            });

            // Official MOPH Vans & Vehicles in West Stalls
            const van1 = createMophVanMesh();
            van1.position.set(-10.5, 0.32, -1.2);
            const van2 = createMophVanMesh();
            van2.position.set(-0.8, 0.32, -1.0);
            const pickup = createSimpleCarMesh(0x3f3f46);
            pickup.position.set(2.4, 0.32, 1.8);
            shell.add(van1, van2, pickup);

            // Drive-through Lane Ground Markings (x = -5.0 local, world X = -8.0)
            const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
            [-2.5, 2.0].forEach(az => {
                const arr = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.6), arrowMat);
                arr.position.set(-5.0, 0.04, az);
                arr.rotation.x = -Math.PI / 2;
                shell.add(arr);
            });

            // 2. Enclosed East Ground Floor (OSSC Center & Elevator Lobby)
            const rightEncW = 9.8;
            const rightBox = new THREE.Mesh(new THREE.BoxGeometry(rightEncW, h - 0.35, d - 0.4), mintWallMat);
            rightBox.position.set(w / 2 - rightEncW / 2 - 0.2, h / 2, 0);
            rightBox.castShadow = true;
            shell.add(rightBox);

            // 3. OSSC North Entrance Canopy & Automatic Sliding Doors (`20855.jpg` & `20854.jpg`)
            const osscGroup = new THREE.Group();
            osscGroup.position.set(8.8, 0, -d / 2);

            // Cantilevered white concrete canopy
            const osscCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.28, 2.6), frameMat);
            osscCanopy.position.set(0, h - 0.35, -1.25);
            osscCanopy.castShadow = true;
            osscGroup.add(osscCanopy);

            // Recessed ceiling spotlights under canopy
            const spotMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
            [-1.5, 0, 1.5].forEach(sx => {
                const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), spotMat);
                spot.position.set(sx, h - 0.50, -1.25);
                osscGroup.add(spot);
            });

            // OSSC Main Signboard above canopy
            const osscSignPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(4.4, 1.1),
                new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.osscEntranceBanner, side: THREE.DoubleSide })
            );
            osscSignPlane.position.set(0, h + 0.35, -0.05);
            osscGroup.add(osscSignPlane);

            // Automatic glass sliding double doors
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.8, transparent: true, opacity: 0.85 });
            const glassDoors = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.3, 0.12), doorMat);
            glassDoors.position.set(0, 1.15, -0.06);
            osscGroup.add(glassDoors);

            shell.add(osscGroup);

            // 4. Wheelchair Accessible Ramp into East Lobby (Flooring up to elevator level)
            const rampGroup = new THREE.Group();
            rampGroup.position.set(9.2, 0, d / 2 + 1.2);

            const rampSlab = new THREE.Mesh(
                new THREE.BoxGeometry(2.0, 0.32, 2.4),
                new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 })
            );
            rampSlab.position.set(0, 0.16, 0);
            rampSlab.rotation.x = 0.12; // gentle sloped ramp
            rampGroup.add(rampSlab);

            // Stainless steel handrails on both sides of ramp
            const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
            [-1.05, 1.05].forEach(rx => {
                // Posts
                [-0.9, 0.9].forEach(rz => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), railMat);
                    post.position.set(rx, 0.65, rz);
                    rampGroup.add(post);
                });
                // Top rail
                const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 8), railMat);
                topRail.position.set(rx, 1.05, 0);
                topRail.rotation.x = Math.PI / 2 + 0.12;
                rampGroup.add(topRail);
            });

            // Blue wheelchair accessible signage post
            const rampSign = new THREE.Mesh(
                new THREE.PlaneGeometry(0.55, 0.55),
                new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.safety100Sign, side: THREE.DoubleSide })
            );
            rampSign.position.set(1.25, 1.2, 1.1);
            rampSign.rotation.y = -Math.PI / 2;
            rampGroup.add(rampSign);

            shell.add(rampGroup);

            // 5. South Louvered Service Door & Wooden Steps (`20261109_163722.jpg` & `20847.jpg`)
            const whiteDoor = new THREE.Mesh(
                new THREE.BoxGeometry(1.38, 2.65, 0.16),
                new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.whiteLouverDoor })
            );
            whiteDoor.position.set(5.2, 1.58, d / 2 + 0.02);
            shell.add(whiteDoor);

            const woodStepMat = new THREE.MeshStandardMaterial({ color: 0x92400e });
            for (let st = 0; st < 3; st++) {
                const step = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.14, 0.32), woodStepMat);
                step.position.set(5.2, 0.18 + st * 0.16, d / 2 + 0.75 - st * 0.24);
                shell.add(step);
            }
            const orangeCone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.68, 12), new THREE.MeshStandardMaterial({ color: 0xea580c }));
            orangeCone.position.set(4.25, 0.52, d / 2 + 0.48);
            shell.add(orangeCone);

            // Potted Elephant-Ear Plants along South Facade (`20858.jpg`)
            [-6.5, -2.2, 2.2].forEach(bx => {
                const whitePot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.26, 0.52, 12), frameMat);
                whitePot.position.set(bx, 0.42, d / 2 + 0.72);
                const bigLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.35, 6), new THREE.MeshStandardMaterial({ color: 0x65a30d }));
                bigLeaf.position.set(bx, 1.15, d / 2 + 0.72);
                shell.add(whitePot, bigLeaf);
            });
        }
        // ==========================================
        // FLOORS 2, 3, 4 DETAILS
        // ==========================================
        else {
            const wallThickness = 0.28;
            const frontWall = new THREE.Mesh(new THREE.BoxGeometry(w - 7.2, h - 0.35, wallThickness), mintWallMat);
            frontWall.position.set(2.8, h / 2, d / 2 - wallThickness / 2);
            const backWall = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, h - 0.35, wallThickness), mintWallMat);
            backWall.position.set(0, h / 2, -d / 2 + wallThickness / 2);
            const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, h - 0.35, d - 0.3), mintWallMat);
            westWall.position.set(-w / 2 + wallThickness / 2, h / 2, 0);
            shell.add(frontWall, backWall, westWall);

            // South Recessed Access Walkway Parapet
            const balcParapet = new THREE.Mesh(new THREE.BoxGeometry(w - 7.5, 1.15, 0.22), mintWallMat);
            balcParapet.position.set(-1.0, 0.65, d / 2 + 0.05);
            balcParapet.castShadow = true;
            shell.add(balcParapet);

            // Open Stairwell Balcony on South-West Bay (`20847.jpg`)
            const stairParapet = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.15, 0.24), mintWallMat);
            stairParapet.position.set(-9.8, 0.65, d / 2 - 0.12);
            shell.add(stairParapet);

            // Floor 2 Skybridge Connection Portal & Double Glass Doors
            if (floor === 2) {
                const portalGroup = new THREE.Group();
                portalGroup.position.set(-2.2, 0, d / 2 + 0.08);

                const pFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 0.2), sageTrimMat);
                pFrame.position.set(0, 1.25, 0);
                const pGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.12), glassMat);
                pGlass.position.set(0, 1.25, 0.02);
                const pSign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.32, 0.22), sageTrimMat);
                pSign.position.set(0, 2.6, 0);

                portalGroup.add(pFrame, pGlass, pSign);
                shell.add(portalGroup);
            }

            // Floor 4 (Top Floor): Potted Plants on Balcony Loggia (`20858.jpg`)
            if (floor === 4) {
                [-4.5, 0.0, 4.5].forEach(px => {
                    const whitePot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.45, 12), frameMat);
                    whitePot.position.set(px, 1.35, d / 2 - 0.05);
                    const plant = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 6), new THREE.MeshStandardMaterial({ color: 0x4d7c0f }));
                    plant.position.set(px, 1.95, d / 2 - 0.05);
                    shell.add(whitePot, plant);
                });
            }

            // North Facade Horizontal Sunshade Louver Grille (`20854.jpg` & `20863.jpg`)
            const louverBand = new THREE.Mesh(
                new THREE.BoxGeometry(20.5, 0.48, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.65, roughness: 0.35 })
            );
            louverBand.position.set(-0.2, h - 0.45, -d / 2 - 0.20);
            louverBand.castShadow = true;
            shell.add(louverBand);

            // North Ribbon Windows & AC Condenser Units
            [-6.8, -0.5, 5.5].forEach(nbx => {
                const nWinFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.85, 0.16), frameMat);
                nWinFrame.position.set(nbx, h * 0.48, -d / 2 - 0.02);
                const nWinGlass = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.62, 0.18), glassMat);
                nWinGlass.position.set(nbx, h * 0.48, -d / 2 - 0.03);
                shell.add(nWinFrame, nWinGlass);

                // Multiple AC Outdoor Units on Structural Shelves
                [-1.5, 0.9].forEach(acOffset => {
                    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.68, 0.42), acBoxMat);
                    acUnit.position.set(nbx + acOffset, 0.55, -d / 2 - 0.28);
                    acUnit.castShadow = true;
                    shell.add(acUnit);
                });
            });

            // Single Vertical Awning Window Column on West Bay (`20863.jpg`)
            const singleVFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.75, 0.18), sageTrimMat);
            singleVFrame.position.set(-11.2, h * 0.52, -d / 2 - 0.02);
            const singleVGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.45, 0.20), glassMat);
            singleVGlass.position.set(-11.2, h * 0.52, -d / 2 - 0.03);
            shell.add(singleVFrame, singleVGlass);

            // South Triplet Awning Windows
            [3.2, 7.5].forEach(bx => {
                const wFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.96, 0.16), sageTrimMat);
                wFrame.position.set(bx, h - 1.05, d / 2 - wallThickness + 0.02);
                const wGlass = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.68, 0.18), glassMat);
                wGlass.position.set(bx, h - 1.05, d / 2 - wallThickness + 0.03);
                shell.add(wFrame, wGlass);
            });
        }
    }

    // ===================== 2. ตึกหน้า 2 ชั้น (2F) =====================
    // Detailed architectural shell modelled from real site photos (`f1.jpg`, `f12.jpg`, `f122.jpg`)
    // 100% Parametric: adapts cleanly to dynamic width 'w', depth 'd', and floor height 'h'
    else if (bld.id === '2F') {
        const ceruleanBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
        const brightSkyBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
        const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });
        const whiteWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
        const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const silverMetalMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof, roughness: 0.4 });
        const blueMetalMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.blueMetalRoof, roughness: 0.4 });
        const ribbonWinMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.bld1Windows, roughness: 0.15, metalness: 0.35 });

        // Parametric Wing Proportions
        const leftW = w * 0.40;
        const rightW = w - leftW;
        const leftX = -w / 2 + leftW / 2;
        const rightX = w / 2 - rightW / 2;

        // Main Building Body Core
        const coreWall = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, h - 0.2, d - 0.2), brightSkyBlueMat);
        coreWall.position.y = h / 2;
        coreWall.castShadow = true;
        coreWall.receiveShadow = true;
        shell.add(coreWall);

        // Continuous Horizontal Floor-Divider Belt Course (คิ้วบัวปูนยื่นรอบตัวอาคาร)
        const beltCourse = new THREE.Mesh(new THREE.BoxGeometry(w + 0.35, 0.32, d + 0.35), ceruleanBlueMat);
        beltCourse.position.y = h - 0.16;
        beltCourse.castShadow = true;
        shell.add(beltCourse);

        // ==========================================
        // FLOOR 1 (ชั้น 1) DETAILS
        // ==========================================
        if (floor === 1) {
            // 1. Raised Sloped Podium Plinth (ฐานปูนลาดเอียงสีฟ้าสดด้านหน้าอาคาร) (`f1.jpg` & `f12.jpg`)
            const plinthApron = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.6, 0.45, 1.4),
                ceruleanBlueMat
            );
            plinthApron.position.set(0, 0.22, d / 2 + 0.65);
            plinthApron.castShadow = true;
            plinthApron.receiveShadow = true;
            shell.add(plinthApron);

            // Left Wing Stepped Base & Access Ramp (`f12.jpg` & `f1.jpg`)
            const rampW = Math.min(4.5, leftW * 0.45);
            const ramp = new THREE.Mesh(
                new THREE.BoxGeometry(rampW, 0.42, 2.2),
                ceruleanBlueMat
            );
            ramp.position.set(leftX, 0.18, d / 2 + 1.6);
            ramp.rotation.x = 0.14; // sloped ramp
            shell.add(ramp);

            // 2. Central Entrance Porch (ซุ้มมุขทางเข้าหลักหน้าตึกพร้อมหลังคาหน้าจั่ว) (`f122.jpg`)
            const porchW = Math.min(4.8, rightW * 0.35);
            const porchX = leftX + leftW / 2 + porchW / 2 + 0.3;

            const porchGroup = new THREE.Group();
            porchGroup.position.set(porchX, 0, d / 2 + 1.2);

            // Porch Tiled Steps
            const pStep1 = new THREE.Mesh(new THREE.BoxGeometry(porchW, 0.22, 2.6), whiteWallMat);
            pStep1.position.y = 0.11;
            const pStep2 = new THREE.Mesh(new THREE.BoxGeometry(porchW - 0.6, 0.22, 2.2), whiteWallMat);
            pStep2.position.y = 0.33;
            porchGroup.add(pStep1, pStep2);

            // Dual Porch Support Pillars
            const colOffset = (porchW - 0.7) / 2;
            [-colOffset, colOffset].forEach(px => {
                const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), ceruleanBlueMat);
                col.position.set(px, 1.45, 0.95);
                col.castShadow = true;
                porchGroup.add(col);
            });

            // Double Glass Sliding Doors & Framed Entrance
            const doorW = Math.min(3.2, porchW - 0.8);
            const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorW, 2.2, 0.14), darkFrameMat);
            doorFrame.position.set(0, 1.4, -0.9);
            const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(doorW - 0.3, 2.0), ribbonWinMat);
            doorGlass.position.set(0, 1.4, -0.82);
            porchGroup.add(doorFrame, doorGlass);

            // Triangular Pitched Gable Roof Structure (`f122.jpg`)
            const gableGroup = new THREE.Group();
            gableGroup.position.set(0, 2.7, 0.2);

            // Triangular Gable Fascia Pediment
            const pedimentRadius = porchW * 0.55;
            const gablePediment = new THREE.Mesh(
                new THREE.ConeGeometry(pedimentRadius, 0.95, 3),
                whiteWallMat
            );
            gablePediment.rotation.z = Math.PI;
            gablePediment.rotation.y = Math.PI / 2;
            gablePediment.scale.set(0.12, 1, 1.8);
            gableGroup.add(gablePediment);

            // Sloping Gable Roof Panels (Left & Right Pitch)
            const pitchW = pedimentRadius + 0.2;
            const leftPitch = new THREE.Mesh(new THREE.BoxGeometry(pitchW, 0.12, 2.4), silverMetalMat);
            leftPitch.position.set(-pitchW * 0.38, 0.4, 0);
            leftPitch.rotation.z = 0.38;
            const rightPitch = new THREE.Mesh(new THREE.BoxGeometry(pitchW, 0.12, 2.4), silverMetalMat);
            rightPitch.position.set(pitchW * 0.38, 0.4, 0);
            rightPitch.rotation.z = -0.38;
            gableGroup.add(leftPitch, rightPitch);

            // Gable Signboard ("สำนักงานสาธารณสุขจังหวัดมุกดาหาร")
            const signPlaneW = Math.min(3.2, porchW * 0.72);
            const gableSignPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(signPlaneW, 0.65),
                new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.bld1GableSign, side: THREE.DoubleSide })
            );
            gableSignPlane.position.set(0, 0.15, 1.15);
            gableGroup.add(gableSignPlane);

            porchGroup.add(gableGroup);
            shell.add(porchGroup);

            // 3. Front Ribbon Windows on Floor 1
            // Left Wing Window
            const leftWinW = leftW - 1.2;
            const leftWin1F = new THREE.Mesh(
                new THREE.BoxGeometry(leftWinW, 1.85, 0.12),
                ribbonWinMat
            );
            leftWin1F.position.set(leftX, 1.45, d / 2 + 0.08);
            shell.add(leftWin1F);

            // Left Wing Vertical Accent Pillars
            const pillarCount = Math.max(2, Math.floor(leftWinW / 2.8));
            const pStep = leftWinW / (pillarCount + 1);
            for (let i = 1; i <= pillarCount; i++) {
                const px = leftX - leftWinW / 2 + i * pStep;
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.4, 0.22), ceruleanBlueMat);
                pillar.position.set(px, 1.5, d / 2 + 0.15);
                pillar.castShadow = true;
                shell.add(pillar);
            }

            // Right Wing Window (From right edge of porch to right building wall)
            const rightWinStartX = porchX + porchW / 2 + 0.4;
            const rightWinEndX = w / 2 - 0.6;
            const rightWinW = Math.max(3.0, rightWinEndX - rightWinStartX);
            const rightWinX = (rightWinStartX + rightWinEndX) / 2;
            const rightWin1F = new THREE.Mesh(
                new THREE.BoxGeometry(rightWinW, 1.85, 0.12),
                ribbonWinMat
            );
            rightWin1F.position.set(rightWinX, 1.45, d / 2 + 0.08);
            shell.add(rightWin1F);

            // 4. Front Corrugated Curved Silver Metal Awning with Stay Rods (`f1.jpg`, `f12.jpg`, `f122.jpg`)
            const awningGroup = new THREE.Group();
            awningGroup.position.set(0, 2.65, d / 2 + 0.95);

            // Curved Awning Roof spanning entire building width
            const awningMesh = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.4, 0.14, 1.8),
                silverMetalMat
            );
            awningMesh.rotation.x = 0.08;
            awningMesh.castShadow = true;
            awningGroup.add(awningMesh);

            // Downward Curved Front Eave Edge
            const awningLip = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.4, 0.28, 0.08),
                silverMetalMat
            );
            awningLip.position.set(0, -0.12, 0.9);
            awningGroup.add(awningLip);

            // Diagonal Steel Stay Rods (เหล็กดึงสลิงทแยงมุมยึดกับผนังชั้น 2)
            const rodCount = Math.max(6, Math.round(w / 2.6));
            const rodSpacing = (w - 1.6) / (rodCount - 1);
            for (let i = 0; i < rodCount; i++) {
                const rx = -w / 2 + 0.8 + i * rodSpacing;
                // Avoid placing rod directly within the porch entrance opening
                if (Math.abs(rx - porchX) < (porchW / 2 + 0.2)) continue;
                const rod = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 1.95, 6),
                    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
                );
                rod.position.set(rx, 0.62, -0.2);
                rod.rotation.x = -0.68;
                awningGroup.add(rod);
            }
            shell.add(awningGroup);

            // 5. Rear Facade (Connecting to Courtyard / 4F)
            const rearAwning = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.4, 0.16, 1.8),
                blueMetalMat
            );
            rearAwning.position.set(0, h - 0.35, -d / 2 - 0.85);
            rearAwning.rotation.x = -0.22;
            shell.add(rearAwning);

            const acMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.acUnit });
            const acCount = Math.max(3, Math.floor(w / 5.5));
            const acSpacing = (w - 3.0) / (acCount - 1);
            for (let i = 0; i < acCount; i++) {
                const ax = -w / 2 + 1.5 + i * acSpacing;
                const acBox = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.68, 0.42), acMat);
                acBox.position.set(ax, 2.1, -d / 2 - 0.25);
                shell.add(acBox);
            }
        }

        // ==========================================
        // FLOOR 2 (ชั้น 2) DETAILS
        // ==========================================
        if (floor === 2) {
            // 1. Left Wing Projecting Forward Mass (`f1.jpg` & `f12.jpg`)
            const leftProjectingBody = new THREE.Mesh(
                new THREE.BoxGeometry(leftW + 0.2, h - 0.2, 1.1),
                ceruleanBlueMat
            );
            leftProjectingBody.position.set(leftX, h / 2, d / 2 + 0.45);
            leftProjectingBody.castShadow = true;
            shell.add(leftProjectingBody);

            // Thick Cantilevered Flat Roof Overhang on Left Wing
            const leftRoofVisor = new THREE.Mesh(
                new THREE.BoxGeometry(leftW + 0.6, 0.42, 1.6),
                ceruleanBlueMat
            );
            leftRoofVisor.position.set(leftX, h - 0.2, d / 2 + 0.7);
            leftRoofVisor.castShadow = true;
            shell.add(leftRoofVisor);

            // Left Wing Upper Ribbon Windows
            const leftWin2FW = leftW - 1.0;
            const leftWin2F = new THREE.Mesh(
                new THREE.BoxGeometry(leftWin2FW, 1.75, 0.12),
                ribbonWinMat
            );
            leftWin2F.position.set(leftX, 1.35, d / 2 + 1.02);
            shell.add(leftWin2F);

            // 2. Right Wing Signboards & Windows (`f122.jpg` & `f1.jpg`)
            // The Royal Memorial Banner
            const bannerW = Math.min(3.5, rightW * 0.26);
            const bannerX = leftX + leftW / 2 + 0.2 + bannerW / 2;

            const bannerGroup = new THREE.Group();
            bannerGroup.position.set(bannerX, 1.45, d / 2 + 0.22);

            const bannerBoard = new THREE.Mesh(
                new THREE.BoxGeometry(bannerW, 2.15, 0.12),
                new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 })
            );
            const bannerFace = new THREE.Mesh(
                new THREE.PlaneGeometry(bannerW - 0.1, 2.05),
                new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.royalMemorial, side: THREE.DoubleSide })
            );
            bannerFace.position.z = 0.08;
            bannerGroup.add(bannerBoard, bannerFace);
            shell.add(bannerGroup);

            // The Main Office Signboard ("สำนักงานสาธารณสุขจังหวัดมุกดาหาร" + MOPH Logo)
            const mainSignStartX = bannerX + bannerW / 2 + 0.3;
            const mainSignEndX = w / 2 - 0.3;
            const mainSignW = Math.max(5.0, mainSignEndX - mainSignStartX);
            const mainSignX = (mainSignStartX + mainSignEndX) / 2;

            const mainSignGroup = new THREE.Group();
            mainSignGroup.position.set(mainSignX, 1.85, d / 2 + 0.24);

            const mainSignBoard = new THREE.Mesh(
                new THREE.BoxGeometry(mainSignW, 1.35, 0.12),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
            );
            const mainSignFace = new THREE.Mesh(
                new THREE.PlaneGeometry(mainSignW - 0.15, 1.25),
                new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.bld1MainSign, side: THREE.DoubleSide })
            );
            mainSignFace.position.z = 0.08;
            mainSignGroup.add(mainSignBoard, mainSignFace);
            shell.add(mainSignGroup);

            // Ribbon Windows on Right Wing Floor 2 (Under the Signboard)
            const rightWin2F = new THREE.Mesh(
                new THREE.BoxGeometry(mainSignW, 0.95, 0.12),
                ribbonWinMat
            );
            rightWin2F.position.set(mainSignX, 0.65, d / 2 + 0.18);
            shell.add(rightWin2F);

            // Vertical Blue Corrugated Siding Panels along Upper Edge
            const blueFascia = new THREE.Mesh(
                new THREE.BoxGeometry(mainSignW, 0.45, 0.2),
                blueMetalMat
            );
            blueFascia.position.set(mainSignX, h - 0.25, d / 2 + 0.18);
            shell.add(blueFascia);

            // Concrete ventilation square blocks on west side notch
            for (let vy = 0.8; vy <= 2.2; vy += 0.45) {
                const ventBlock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 1.8), darkTrimMat);
                ventBlock.position.set(leftX + leftW / 2 + 0.12, vy, d / 2 - 0.4);
                shell.add(ventBlock);
            }
        }
    }

    // ===================== 3. คลินิกบริการแพทย์แผนไทย (TTM) =====================
    else if (bld.id === 'TTM') {
        const whiteWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(w - 0.8, h - 0.3, d - 1.4), whiteWallMat);
        body.position.set(0, h / 2, -0.4);
        shell.add(body);

        // Brown Wood-Slat Wall with "@ สสจ.มุกดาหาร" Sign (`20261109_163704.jpg`)
        const woodSignWall = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 2.6, 0.16),
            new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.ttmWoodSign })
        );
        woodSignWall.position.set(-2.2, 1.45, d / 2 + 0.25);
        shell.add(woodSignWall);

        // Twin Yellow Diamond-Lattice Columns (`เสาลายฉลุสีเหลืองคู่`)
        const yellowMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.yellowLattice });
        [-4.8, -3.6].forEach(yx => {
            const yPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.5, 0.14), yellowMat);
            yPillar.position.set(yx, 1.4, d / 2 + 0.22);
            shell.add(yPillar);
        });

        // White Marble Table & Benches (`ม้านั่งหินอ่อนขาว`)
        const marbleTable = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 0.8), frameMat);
        marbleTable.position.set(2.5, 0.45, d / 2 + 0.1);
        shell.add(marbleTable);
    }

    // ===================== 4. ศูนย์บริการผลิตภัณฑ์สุขภาพฯ (FDA) =====================
    else if (bld.id === 'FDA') {
        const fdaWall = new THREE.Mesh(
            new THREE.BoxGeometry(w - 0.4, h - 0.3, d - 0.4),
            new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
        );
        fdaWall.position.y = h / 2;
        shell.add(fdaWall);
    }

    // ===================== 5. อาคารอื่น ๆ ที่เพิ่มจากระบบ Admin (Custom Dynamic Building) =====================
    else {
        const wallCol = bld.color || 0x10b981;
        const mainWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
        const trimMat = new THREE.MeshStandardMaterial({ color: wallCol, roughness: 0.45 });

        // Wall Body with subtle inset
        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(w - 0.2, h - 0.15, d - 0.2),
            mainWallMat
        );
        wallMesh.position.y = h / 2;
        shell.add(wallMesh);

        // Accent Floor Band (Cornice)
        const cornice = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.15, 0.25, d + 0.15),
            trimMat
        );
        cornice.position.y = h - 0.12;
        shell.add(cornice);

        // Corner Pilasters (เสามุมอาคารสีตามธีม)
        const colW = 0.45;
        [[-w / 2 + colW / 2, -d / 2 + colW / 2],
         [w / 2 - colW / 2, -d / 2 + colW / 2],
         [-w / 2 + colW / 2, d / 2 - colW / 2],
         [w / 2 - colW / 2, d / 2 - colW / 2]].forEach(([cx, cz]) => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(colW, h, colW), trimMat);
            pillar.position.set(cx, h / 2, cz);
            shell.add(pillar);
        });

        // Modern Windows on South Facade
        const windowCount = Math.max(2, Math.floor(w / 3.5));
        const spacing = (w - 2.0) / (windowCount - 1);
        for (let i = 0; i < windowCount; i++) {
            const wx = -w / 2 + 1.0 + i * spacing;
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.12), glassMat);
            win.position.set(wx, h / 2 + 0.1, d / 2 + 0.02);
            shell.add(win);
        }

        // Entrance Door & Canopy on Floor 1
        if (floor === 1) {
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.85 });
            const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.15), doorMat);
            door.position.set(0, 1.1, d / 2 + 0.05);
            shell.add(door);

            const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.5), trimMat);
            canopy.position.set(0, 2.3, d / 2 + 0.8);
            shell.add(canopy);
        }
    }

    return shell;
}

function buildBuildingRoof(bld) {
    const rGroup = new THREE.Group();
    const w = bld.width;
    const d = bld.depth;

    if (bld.id === '4F') {
        const roofBox = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, 1.5, d + 0.4),
            new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof, roughness: 0.45 })
        );
        roofBox.position.y = 0.75;
        roofBox.castShadow = true;
        rGroup.add(roofBox);

        // Parapet coping band around roof
        const parapet = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.5, 0.45, d + 0.5),
            new THREE.MeshStandardMaterial({ color: 0x84b58c, roughness: 0.5 })
        );
        parapet.position.y = 1.55;
        rGroup.add(parapet);

        // ELEVATOR MACHINE ROOM / PENTHOUSE (หอลิฟต์บนดาดฟ้า)
        const elPenthouseGroup = new THREE.Group();
        elPenthouseGroup.position.set(9.2, 1.5, 2.3);

        const elRoom = new THREE.Mesh(
            new THREE.BoxGeometry(3.0, 2.4, 2.8),
            new THREE.MeshStandardMaterial({ color: 0xe6f4ea, roughness: 0.6 })
        );
        elRoom.position.y = 1.2;
        elRoom.castShadow = true;

        const elCap = new THREE.Mesh(
            new THREE.BoxGeometry(3.3, 0.28, 3.1),
            new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof, roughness: 0.4 })
        );
        elCap.position.y = 2.45;
        elCap.castShadow = true;

        // Maintenance steel door on South side
        const elDoor = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.8, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
        );
        elDoor.position.set(0, 0.9, 1.45);

        // Ventilation louver on North side
        const elLouver = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.7, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
        );
        elLouver.position.set(0, 1.6, -1.45);

        // Aircraft warning beacon & lightning rod
        const rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        rod.position.set(0, 3.4, 0);
        const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        beacon.position.set(0, 4.3, 0);

        elPenthouseGroup.add(elRoom, elCap, elDoor, elLouver, rod, beacon);
        rGroup.add(elPenthouseGroup);

        // Cantilevered Dark-Grey Steel Pergola on OSSC Roof (`20855.jpg` & `20854.jpg`)
        const pergola = new THREE.Mesh(
            new THREE.BoxGeometry(4.6, 0.22, 3.8),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.35 })
        );
        pergola.position.set(w / 2 - 2.4, 1.6, -d / 2 - 1.2);
        pergola.castShadow = true;
        rGroup.add(pergola);

        // Rooftop AC Mechanical Screen & Chiller Units
        const chillerMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.acUnit });
        [-4.5, 0.0, 4.0].forEach(rx => {
            const chiller = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.9), chillerMat);
            chiller.position.set(rx, 2.1, -1.5);
            chiller.castShadow = true;
            rGroup.add(chiller);
        });
    } else if (bld.id === 'TTM') {
        const ttmRoof = new THREE.Mesh(
            new THREE.BoxGeometry(w + 1.2, 0.45, d + 2.2),
            new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.blueMetalRoof })
        );
        ttmRoof.position.set(0, 0.35, 0.4);
        rGroup.add(ttmRoof);
    } else if (bld.id === '2F') {
        const ceruleanBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
        const silverRoofMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof, roughness: 0.4 });
        const blueRoofMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.blueMetalRoof, roughness: 0.4 });

        // Parametric Wing Proportions
        const leftW = w * 0.40;
        const rightW = w - leftW;
        const leftX = -w / 2 + leftW / 2;
        const rightX = w / 2 - rightW / 2;

        // Left Wing Concrete Roof Slab with Projecting Eaves (`f1.jpg` & `f12.jpg`)
        const leftRoofSlab = new THREE.Mesh(
            new THREE.BoxGeometry(leftW + 0.6, 0.48, d + 1.4),
            ceruleanBlueMat
        );
        leftRoofSlab.position.set(leftX, 0.24, 0.5);
        leftRoofSlab.castShadow = true;
        rGroup.add(leftRoofSlab);

        // Right Wing Silver Metal Roof Deck (`f122.jpg`)
        const rightRoofDeck = new THREE.Mesh(
            new THREE.BoxGeometry(rightW + 0.4, 0.65, d + 0.4),
            silverRoofMat
        );
        rightRoofDeck.position.set(rightX, 0.325, 0);
        rightRoofDeck.castShadow = true;
        rGroup.add(rightRoofDeck);

        // Right Wing Sloping Front Blue Metal Visor Eave (`f122.jpg`)
        const frontBlueEave = new THREE.Mesh(
            new THREE.BoxGeometry(rightW + 0.4, 0.22, 1.2),
            blueRoofMat
        );
        frontBlueEave.position.set(rightX, 0.45, d / 2 + 0.45);
        frontBlueEave.rotation.x = 0.32; // sloping downward
        frontBlueEave.castShadow = true;
        rGroup.add(frontBlueEave);

        // Rooftop AC and Service Units
        const acMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.acUnit });
        [-leftW * 0.35, rightW * 0.1, rightW * 0.38].forEach(rx => {
            const ac = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.6), acMat);
            ac.position.set(rx, 0.75, -1.0);
            rGroup.add(ac);
        });
    } else if (bld.id === 'FDA') {
        const stdRoof = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, 0.9, d + 0.4),
            new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof })
        );
        stdRoof.position.y = 0.45;
        rGroup.add(stdRoof);
    } else {
        // Custom Dynamic Building Roof
        const roofMat = new THREE.MeshStandardMaterial({
            color: bld.color || 0x334155,
            roughness: 0.4
        });
        const roofSlab = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, 0.45, d + 0.4),
            roofMat
        );
        roofSlab.position.y = 0.22;
        rGroup.add(roofSlab);

        const parapet = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
        );
        parapet.position.y = 0.45;
        rGroup.add(parapet);
    }
    return rGroup;
}

function buildSkybridge2Fto4F() {
    skybridgeGroup = new THREE.Group();
    skybridgeGroup.position.set(-2.2, BASE_FLOOR_HEIGHT, 0.0);

    const sageMat = new THREE.MeshStandardMaterial({ color: 0x84b58c, roughness: 0.5 });
    const mintMat = new THREE.MeshStandardMaterial({ color: 0xe6f4ea, roughness: 0.6 });
    const louverMat = new THREE.MeshStandardMaterial({ map: REAL_TEXTURES.silverMetalRoof });

    // Support columns reaching to ground (`20847.jpg`)
    // ขยายระยะห่างระหว่างเสาค้ำจาก 3.0m เป็น 4.6m เพื่อให้รถวิ่งลอดผ่านได้สะดวก ไม่อึดอัด
    [-2.3, 2.3].forEach(cx => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.48, BASE_FLOOR_HEIGHT + 3.6, 0.48), sageMat);
        col.position.set(cx, -BASE_FLOOR_HEIGHT / 2 + 1.8, 0);
        col.castShadow = true;
        skybridgeGroup.add(col);
    });

    // Stacked Traffic Signs (`[ ↱ ]` and `[ ↑ ]`) on West Skybridge Column (`20847.jpg`)
    const trafficSignPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.75, 1.4),
        new THREE.MeshBasicMaterial({ map: REAL_TEXTURES.columnTrafficSigns, transparent: true, side: THREE.DoubleSide })
    );
    trafficSignPlane.position.set(-2.58, -BASE_FLOOR_HEIGHT + 2.2, 0);
    trafficSignPlane.rotation.y = -Math.PI / 2;
    skybridgeGroup.add(trafficSignPlane);

    // Bridge Deck & Parapet Walls (ขยายความกว้างตัวสะพานทางเชื่อมจาก 3.4m เป็น 5.2m กว้างขวางสมส่วน)
    const bridgeW = 5.2;
    const bridgeL = 7.6;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 0.35, bridgeL), sageMat);
    deck.position.y = 0.18;
    deck.castShadow = true;
    deck.receiveShadow = true;

    const parapetL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.25, bridgeL), mintMat);
    parapetL.position.set(-bridgeW / 2 + 0.12, 0.88, 0);
    const parapetR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.25, bridgeL), mintMat);
    parapetR.position.set(bridgeW / 2 - 0.12, 0.88, 0);

    const sunScreen = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, bridgeL * 0.55), louverMat);
    sunScreen.position.set(-bridgeW / 2 + 0.12, 2.2, 0);

    const roofBeam = new THREE.Mesh(new THREE.BoxGeometry(bridgeW + 0.35, 0.32, bridgeL), sageMat);
    roofBeam.position.y = 3.3;
    roofBeam.castShadow = true;

    skybridgeGroup.add(deck, parapetL, parapetR, sunScreen, roofBeam);
    scene.add(skybridgeGroup);
}

function createSimpleCarMesh(colorHex) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.25, metalness: 0.35 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    const lower = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.72, 1.68), bodyMat);
    lower.position.y = 0.52;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.62, 1.48), bodyMat);
    upper.position.set(-0.15, 1.15, 0);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.50, 1.52), glassMat);
    glass.position.set(-0.15, 1.15, 0);
    g.add(lower, upper, glass);
    return g;
}

function createMophVanMesh() {
    const g = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.65, 4.25), whiteMat);
    body.position.y = 1.05;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.22, 4.26), stripeMat);
    stripe.position.y = 0.85;
    const windows = new THREE.Mesh(new THREE.BoxGeometry(1.91, 0.58, 3.85), glassMat);
    windows.position.set(0, 1.38, -0.1);
    g.add(body, stripe, windows);
    return g;
}

// ============================================================================
// 5. HTML 3D FLOATING PINS & CAMERA CONTROLS
// ============================================================================
function buildHTMLPins() {
    const container = document.getElementById('pins-container');
    container.innerHTML = '';
    htmlPins = [];

    // Building Roof Pins
    Object.values(BUILDINGS_META).forEach(bld => {
        const el = document.createElement('div');
        el.className = 'pin-3d';
        el.innerHTML = `
            <div onclick="focusBuilding3D('${bld.id}')" class="glass-panel px-2.5 py-1 rounded-xl border border-emerald-400/50 shadow-lg flex items-center gap-1.5 hover:border-amber-400">
                <img src="assets/logo MOPH.png" class="w-4 h-4 rounded-full bg-white p-0.5" onerror="this.style.display='none'">
                <span class="text-[11px] font-heading font-bold text-white whitespace-nowrap">${escapeHtml(bldShort(bld.id))}</span>
            </div>
        `;
        container.appendChild(el);
        htmlPins.push({
            el,
            type: 'building',
            buildingId: bld.id,
            getWorldPos: () => new THREE.Vector3(
                bld.centerX,
                bld.floors * BASE_FLOOR_HEIGHT + (bld.floors - 1) * explodeFactor * 2.2 + 2.4,
                bld.centerZ
            )
        });
    });

    // Executive Room Pin (Dr. Narong - R431)
    const execEl = document.createElement('div');
    execEl.className = 'pin-3d pin-executive';
    execEl.innerHTML = `
        <div onclick="focusRoom3D('R431')" class="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-1 pr-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-1.5">
            <img src="assets/dr-Narong3.png" class="w-7 h-7 rounded-full object-cover object-top bg-white border border-amber-900"
                 onerror="this.src='assets/icon.svg'">
            <div class="leading-tight">
                <div class="text-[10px] font-heading font-extrabold">นพ.ณรงค์ จันทร์แก้ว</div>
                <div class="text-[9px] font-semibold">ห้องผู้บริหาร (ตึก 4F ชั้น 3)</div>
            </div>
        </div>
    `;
    container.appendChild(execEl);
    htmlPins.push({
        el: execEl,
        type: 'executive',
        getWorldPos: () => {
            const mesh = roomMeshMap['R431'];
            if (!mesh) return new THREE.Vector3(-11, 10, -8);
            const v = new THREE.Vector3();
            mesh.getWorldPosition(v);
            v.y += 2.2;
            return v;
        }
    });
}

const _pinProj = new THREE.Vector3();
function updateHTMLPinsPosition() {
    if (!camera || !renderer) return;
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;

    htmlPins.forEach(pin => {
        const proj = _pinProj.copy(pin.getWorldPos()).project(camera);
        if (proj.z > 1) {
            pin.el.style.display = 'none';
            return;
        }
        const x = (proj.x * 0.5 + 0.5) * width;
        const y = (-(proj.y * 0.5) + 0.5) * height;
        pin.el.style.display = 'block';
        pin.el.style.left = `${x}px`;
        pin.el.style.top = `${y}px`;
    });

    if (userGpsPinEl && userGpsBeacon && userGpsBeacon.visible) {
        const v = new THREE.Vector3(userGpsBeacon.position.x, 1.8, userGpsBeacon.position.z);
        const proj = _pinProj.copy(v).project(camera);
        if (proj.z > 1) {
            userGpsPinEl.style.display = 'none';
        } else {
            userGpsPinEl.style.display = 'block';
            const x = (proj.x * 0.5 + 0.5) * width;
            const y = (-(proj.y * 0.5) + 0.5) * height;
            userGpsPinEl.style.left = `${x}px`;
            userGpsPinEl.style.top = `${y}px`;
        }
    }
}

function setupMouseTouchControls() {
    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    const pointers = new Map();   // pointerId -> {x, y}
    let pinchDist = 0;
    let dragMoved = 0;            // total px moved since pointerdown; >CLICK_SLOP = drag, not click
    const CLICK_SLOP = 6;
    const clampRadius = r => Math.max(10, Math.min(95, r));

    const orbit = (dx, dy) => {
        camTargetState.theta -= dx * 0.007;
        camTargetState.phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.04, camTargetState.phi - dy * 0.006));
    };
    const pan = (dx, dy) => {
        // pan relative to camera heading so drag direction matches screen
        const s = 0.035 * (camState.radius / 44);
        const c = Math.cos(camState.theta), n = Math.sin(camState.theta);
        camTargetState.target.x -= (dx * c + dy * n) * s;
        camTargetState.target.z -= (-dx * n + dy * c) * s;
    };
    const twoPointerState = () => {
        const [a, b] = [...pointers.values()];
        return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    };

    dom.addEventListener('pointerdown', (e) => {
        try { dom.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        isDragging = true;
        dragButton = e.pointerType === 'mouse' ? e.button : 0;
        prevMouse = { x: e.clientX, y: e.clientY };
        if (pointers.size === 1) dragMoved = 0;
        if (pointers.size === 2) {
            const st = twoPointerState();
            pinchDist = st.dist;
            prevMouse = { x: st.cx, y: st.cy };
            dragMoved = CLICK_SLOP + 1; // multi-touch never counts as a tap
        }
    });

    dom.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size >= 2) {
            const st = twoPointerState();
            if (pinchDist > 0) camTargetState.radius = clampRadius(camTargetState.radius * (pinchDist / st.dist));
            pinchDist = st.dist;
            pan(st.cx - prevMouse.x, st.cy - prevMouse.y);
            prevMouse = { x: st.cx, y: st.cy };
            requestRender();
            return;
        }

        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        prevMouse = { x: e.clientX, y: e.clientY };
        dragMoved += Math.abs(dx) + Math.abs(dy);
        if (dragButton === 0 && !e.shiftKey) orbit(dx, dy); else pan(dx, dy);
        requestRender();
    });

    const endPointer = (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchDist = 0;
        if (pointers.size === 1) {
            const [p] = [...pointers.values()];
            prevMouse = { x: p.x, y: p.y };
        }
        if (pointers.size === 0) isDragging = false;
    };
    dom.addEventListener('pointerup', endPointer);
    dom.addEventListener('pointercancel', endPointer);

    dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        camTargetState.radius = clampRadius(camTargetState.radius + e.deltaY * 0.03);
        requestRender();
    }, { passive: false });

    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Click Room Selection (ignored if the pointer was dragged)
    dom.addEventListener('click', (e) => {
        if (dragMoved > CLICK_SLOP) return;
        const rect = dom.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(roomMeshes, false);
        if (hits.length > 0 && hits[0].object.visible) {
            const rId = hits[0].object.userData.roomId;
            if (rId) focusRoom3D(rId);
        }
    });
}

// Render loop: full rate while the camera moves; ~15fps when idle (only traffic arrows bob);
// stopped entirely when the tab is hidden or the WebGL context is lost.
let rafId = 0;
let lastIdleRender = 0;
let forceRender = true;
let glContextLost = false;
const IDLE_FRAME_MS = 66;

function requestRender() {
    forceRender = true;
    if (!rafId && !document.hidden && !glContextLost) rafId = requestAnimationFrame(animate3D);
}

function cameraSettled() {
    return Math.abs(camTargetState.radius - camState.radius) < 0.002 &&
           Math.abs(camTargetState.theta - camState.theta) < 0.0002 &&
           Math.abs(camTargetState.phi - camState.phi) < 0.0002 &&
           camState.target.distanceToSquared(camTargetState.target) < 0.000004;
}

function animate3D(now) {
    rafId = 0;
    if (document.hidden || glContextLost) return;
    rafId = requestAnimationFrame(animate3D);
    now = now || performance.now();

    const settled = cameraSettled() && !isDragging;
    if (settled && !forceRender && now - lastIdleRender < IDLE_FRAME_MS) return;
    lastIdleRender = now;
    forceRender = false;

    // Smooth camera interpolation
    camState.radius += (camTargetState.radius - camState.radius) * 0.1;
    camState.theta += (camTargetState.theta - camState.theta) * 0.1;
    camState.phi += (camTargetState.phi - camState.phi) * 0.1;
    camState.target.lerp(camTargetState.target, 0.1);

    camera.position.x = camState.target.x + camState.radius * Math.sin(camState.phi) * Math.sin(camState.theta);
    camera.position.y = camState.target.y + camState.radius * Math.cos(camState.phi);
    camera.position.z = camState.target.z + camState.radius * Math.sin(camState.phi) * Math.cos(camState.theta);
    camera.lookAt(camState.target);

    // Animate user GPS beacon pulse if present
    if (userGpsBeacon && userGpsBeacon.visible) {
        const pulse = 1 + Math.sin(now * 0.006) * 0.18;
        if (userGpsBeacon.children[0]) userGpsBeacon.children[0].scale.setScalar(pulse);
        forceRender = true;
    }

    updateHTMLPinsPosition();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    requestRender();
}

function disposeObject3D(root) {
    root.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => {
                if (m.map) m.map.dispose();
                m.dispose();
            });
        }
    });
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============================================================================
// 6. UI INTERACTION FUNCTIONS (FLOOR FILTER, EXPLODE, PHOTO SPOTS, WAYFINDING)
// ============================================================================
function setExteriorMode(mode) {
    currentExteriorMode = mode;
    ['realistic', 'hybrid', 'interior'].forEach(m => {
        const btn = document.getElementById(`btn-ext-${m}`);
        if (btn) {
            btn.className = (m === mode)
                ? 'px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-emerald-600 text-white shadow flex items-center gap-1'
                : 'px-2.5 py-1 rounded-lg text-xs font-heading font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1';
        }
    });

    exteriorShells.forEach(shell => {
        if (mode === 'realistic') {
            shell.visible = true;
        } else if (mode === 'hybrid') {
            shell.visible = true;
        } else {
            shell.visible = false;
        }
    });

    Object.values(roofGroups).forEach(r => {
        r.visible = (mode === 'realistic' && currentFloorFilter === 'ALL');
    });

    roomMeshes.forEach(rm => {
        const rFloor = rm.userData.roomData.floor;
        const matchFloor = (currentFloorFilter === 'ALL' || rFloor === currentFloorFilter);
        rm.visible = (mode !== 'realistic') && matchFloor;
    });
}

function toggleFloorDropdown() {
    const menu = document.getElementById('floor-dropdown-menu');
    const chevron = document.getElementById('floor-dropdown-chevron');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
        if (chevron) chevron.classList.add('rotate-180');
    } else {
        closeFloorDropdown();
    }
}

function closeFloorDropdown() {
    const menu = document.getElementById('floor-dropdown-menu');
    const chevron = document.getElementById('floor-dropdown-chevron');
    if (!menu) return;
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    if (chevron) chevron.classList.remove('rotate-180');
}

window.toggleFloorDropdown = toggleFloorDropdown;
window.closeFloorDropdown = closeFloorDropdown;

document.addEventListener('click', (e) => {
    const container = document.getElementById('floor-picker-container');
    if (container && !container.contains(e.target)) {
        closeFloorDropdown();
    }
});

function select3DFloor(floor) {
    currentFloorFilter = floor;
    ['ALL', 1, 2, 3, 4].forEach(fl => {
        const btn = document.getElementById(`btn-fl-${fl}`);
        if (btn) {
            const isSel = (fl === floor);
            btn.className = isSel
                ? 'fl-btn w-full px-2.5 py-1.5 rounded-xl text-xs font-heading font-semibold text-left flex items-center justify-between bg-emerald-600 text-white shadow transition cursor-pointer'
                : 'fl-btn w-full px-2.5 py-1.5 rounded-xl text-xs font-heading font-semibold text-left flex items-center justify-between text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer';
            const check = btn.querySelector('.fl-check');
            if (check) {
                if (isSel) check.classList.remove('hidden');
                else check.classList.add('hidden');
            }
        }
    });

    const display = document.getElementById('current-floor-display');
    if (display) {
        const key = floor === 'ALL' ? 'floor.all' : `floor.${floor}`;
        display.setAttribute('data-i18n', key);
        display.textContent = typeof t === 'function' ? t(key) : (floor === 'ALL' ? 'ทุกชั้น' : `ชั้น ${floor}`);
    }

    const mSel = document.getElementById('mobile-floor-select');
    if (mSel) mSel.value = String(floor);

    if (floor !== 'ALL' && currentExteriorMode === 'realistic') {
        setExteriorMode('interior');
    }

    Object.keys(floorGroups).forEach(bId => {
        Object.keys(floorGroups[bId]).forEach(fNum => {
            const fg = floorGroups[bId][fNum];
            const n = parseInt(fNum, 10);
            fg.visible = (floor === 'ALL' || n <= floor);
        });
    });

    Object.values(roofGroups).forEach(r => {
        r.visible = (floor === 'ALL' && currentExteriorMode === 'realistic');
    });

    roomMeshes.forEach(rm => {
        const rFloor = rm.userData.roomData.floor;
        rm.visible = (currentExteriorMode !== 'realistic') && (floor === 'ALL' || rFloor === floor);
    });

    renderDirectoryList();
}

function handleExplodeSlider(val) {
    explodeFactor = parseFloat(val) / 100;
    Object.keys(floorGroups).forEach(bId => {
        const bld = BUILDINGS_META[bId];
        Object.keys(floorGroups[bId]).forEach(fNum => {
            const n = parseInt(fNum, 10);
            floorGroups[bId][n].position.y = (n - 1) * (BASE_FLOOR_HEIGHT + explodeFactor * 2.5);
        });
        if (roofGroups[bId]) {
            roofGroups[bId].position.y = bld.floors * BASE_FLOOR_HEIGHT + (bld.floors - 1) * explodeFactor * 2.5;
        }
    });
    if (skybridgeGroup) {
        skybridgeGroup.position.y = BASE_FLOOR_HEIGHT + explodeFactor * 2.5;
    }
}

function renderBuildingFocusButtons() {
    const container = document.getElementById('building-focus-buttons');
    if (!container) return;
    let html = `
        <button onclick="focusBuilding3D('ALL')" class="bldg-btn ${currentBuildingFilter === 'ALL' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'} text-xs font-heading font-semibold px-2.5 py-1.5 rounded-xl">
            <i class="fa-solid fa-kaaba mr-1"></i><span data-i18n="bld.all">${t('bld.all')}</span>
        </button>
    `;
    Object.values(BUILDINGS_META).forEach(b => {
        const isActive = (currentBuildingFilter === b.id);
        const cls = isActive
            ? 'bldg-btn bg-emerald-600 text-white text-xs font-heading font-semibold px-2.5 py-1.5 rounded-xl shadow'
            : 'bldg-btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-heading font-medium px-2.5 py-1.5 rounded-xl border border-slate-700';
        html += `
            <button onclick="focusBuilding3D('${b.id}')" class="${cls}">
                ${escapeHtml(bldShort(b.id))}
            </button>
        `;
    });
    html += `
        <button onclick="focusSkybridge3D()" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-heading font-medium px-2.5 py-1.5 rounded-xl border border-amber-500/40">
            <i class="fa-solid fa-bridge mr-1"></i><span data-i18n="bld.bridge">${t('bld.bridge')}</span>
        </button>
    `;
    container.innerHTML = html;
}

function focusBuilding3D(bldId) {
    currentBuildingFilter = bldId;
    if (bldId === 'ALL') {
        camTargetState.radius = 44;
        camTargetState.theta = 0.48;
        camTargetState.phi = 1.05;
        camTargetState.target.set(0, 3.2, -2.5);
    } else {
        const b = BUILDINGS_META[bldId];
        if (b) {
            camTargetState.radius = Math.max(22, Math.max(b.width || 20, b.depth || 15) * 1.5);
            camTargetState.theta = 0.35;
            camTargetState.phi = 1.12;
            camTargetState.target.set(b.centerX, (b.floors * BASE_FLOOR_HEIGHT) / 2, b.centerZ);
        }
    }
    renderDirectoryList();
    renderBuildingFocusButtons();
}

function focusSkybridge3D() {
    setExteriorMode('realistic');
    camTargetState.radius = 20;
    camTargetState.theta = -1.32;
    camTargetState.phi = 1.22;
    camTargetState.target.set(-1.5, 4.8, 0.0);
}

function focusBackExitRoute() {
    setExteriorMode('realistic');
    camTargetState.radius = 22;
    camTargetState.theta = 2.95;
    camTargetState.phi = 1.18;
    camTargetState.target.set(-4.0, 5.0, -12.0);
}

function inspectRealPhotoSpot(spotIndex) {
    const spot = REAL_PHOTO_SPOTS[spotIndex];
    if (!spot) return;
    setExteriorMode('realistic');
    select3DFloor('ALL');

    camTargetState.radius = spot.cam.radius;
    camTargetState.theta = spot.cam.theta;
    camTargetState.phi = spot.cam.phi;
    camTargetState.target.set(spot.cam.targetX, spot.cam.targetY, spot.cam.targetZ);

    const card = document.getElementById('photo-compare-card');
    document.getElementById('photo-compare-title').textContent = spot.title;
    document.getElementById('photo-compare-img').src = spot.img;
    document.getElementById('photo-compare-desc').textContent = spot.desc;
    card.classList.remove('hidden');
}

function closePhotoCompareCard() {
    document.getElementById('photo-compare-card').classList.add('hidden');
}

function focusRoom3D(roomId) {
    const room = ROOMS_DB.find(r => r.id === roomId);
    if (!room) return;
    selectedRoomId = roomId;

    if (!isSidebarOpen) {
        toggleSidebar(true);
    }
    toggleRoomDetailBody(true);

    if (currentExteriorMode === 'realistic') {
        setExteriorMode('interior');
    }
    select3DFloor(room.floor);

    roomMeshes.forEach(m => {
        const isSel = m.userData.roomId === roomId;
        m.material.emissive = new THREE.Color(isSel ? 0xffffff : 0x000000);
        m.material.emissiveIntensity = isSel ? 0.35 : 0;
    });

    const targetMesh = roomMeshMap[roomId];
    if (targetMesh) {
        const wp = new THREE.Vector3();
        targetMesh.getWorldPosition(wp);
        camTargetState.target.copy(wp);
        camTargetState.radius = 22;
        camTargetState.phi = 1.02;
    }

    clearWayfinding3D();
    renderRoomDetail(room);
    if (!IS_KIOSK) syncRoomToUrl(roomId);
    renderDirectoryList();
}

function renderRoomDetail(room) {
    document.getElementById('detail-badge').textContent =
        `${bldShort(room.building)} • ${t('floor.n', { n: room.floor })} • ${t('room.n', { n: room.roomNo })}`;
    document.getElementById('detail-phone').innerHTML = room.phone
        ? `<i class="fa-solid fa-phone-volume mr-1"></i>${escapeHtml(room.phone)}` : '';
    document.getElementById('detail-title').textContent = roomName(room);
    document.getElementById('detail-head').textContent = room.head;
    document.getElementById('detail-desc').textContent = roomDesc(room);
    renderBookingStatus(room);
}

// ============================================================================
// WAYFINDING: Dijkstra over nav graph from the snapshot (NAV). Rooms are linked at
// runtime to the 2 nearest nodes on their building/floor, so admin room moves never break routes.
// ============================================================================
// ============================================================================
// WAYFINDING (ปิดการใช้งานระบบเดินทาง/นำทางทั้งหมดตามคำสั่งผู้ใช้งาน)
// ============================================================================
function draw3DWayfindingToSelected() {
    clearWayfinding3D();
}

function drawLegacyRoute() {
    clearWayfinding3D();
}

function describeRoute() {
    return [];
}

function renderRouteSteps() {
    const ol = document.getElementById('route-steps');
    if (ol) { ol.classList.add('hidden'); ol.innerHTML = ''; }
}

function clearWayfinding3D() {
    if (wayfindingGroup) {
        scene.remove(wayfindingGroup);
        disposeObject3D(wayfindingGroup);
        wayfindingGroup = null;
    }
    const btn = document.getElementById('btn-clear-route');
    if (btn) btn.classList.add('hidden');
}

function showToast(message, duration = 4000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-heading font-semibold shadow-2xl border border-sky-500/50 flex items-center gap-2 pointer-events-none transition-all duration-300 opacity-0 translate-y-2';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-satellite-dish text-sky-400"></i> <span>${escapeHtml(message)}</span>`;
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
    }, duration);
}
window.showToast = showToast;

function toggleSatelliteGround() {
    if (!satellitePlane) return;
    satellitePlane.visible = !satellitePlane.visible;
    const btn = document.getElementById('btn-satellite-toggle');
    if (btn) {
        const textSpan = btn.querySelector('span');
        if (satellitePlane.visible) {
            btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-400');
            btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-600');
            if (textSpan) textSpan.textContent = 'ดาวเทียม: เปิด';
        } else {
            btn.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-400');
            btn.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-600');
            if (textSpan) textSpan.textContent = 'ดาวเทียม';
        }
    }
    showToast(satellitePlane.visible ? '🛰️ เปิดแสดงผังภาพถ่ายดาวเทียมจริง (สสจ.มุกดาหาร)' : 'ปิดการแสดงผังดาวเทียม (โหมดโครงร่าง)');
    forceRender = true;
}

// ==========================================
// REAL-TIME GPS GEOLOCATION & BEACON
// Mukdahan Provincial Public Health Office
// Latitude: 16.541450° N, Longitude: 104.724250° E
// ==========================================
const CAMPUS_ORIGIN_LAT = 16.541450;
const CAMPUS_ORIGIN_LON = 104.724250;
const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LON = 111320 * Math.cos(CAMPUS_ORIGIN_LAT * Math.PI / 180);

let userGpsBeacon = null;
let userGpsPinEl = null;

function locateUserGPS() {
    const btn = document.getElementById('btn-gps-locate');
    if (!navigator.geolocation) {
        showToast('เบราว์เซอร์หรืออุปกรณ์ของคุณไม่รองรับ GPS');
        return;
    }

    if (btn) {
        btn.classList.add('animate-pulse');
        const span = btn.querySelector('span');
        if (span) span.textContent = 'กำลังค้นหา...';
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            if (btn) {
                btn.classList.remove('animate-pulse');
                const span = btn.querySelector('span');
                if (span) span.textContent = 'ตำแหน่งฉัน (GPS)';
            }

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const accuracy = Math.round(pos.coords.accuracy || 10);

            // Convert GPS (Lat, Lon) to Three.js scene coordinates (dx, dz)
            const dx = (lon - CAMPUS_ORIGIN_LON) * METERS_PER_DEG_LON;
            const dz = -(lat - CAMPUS_ORIGIN_LAT) * METERS_PER_DEG_LAT;
            const distFromCenter = Math.hypot(dx, dz);

            // Render / update 3D Beacon in Three.js
            if (!userGpsBeacon) {
                userGpsBeacon = new THREE.Group();

                // Outer pulsing ring
                const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
                const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
                const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                ringMesh.rotation.x = -Math.PI / 2;
                userGpsBeacon.add(ringMesh);

                // Inner bright dot
                const dotGeo = new THREE.CircleGeometry(0.8, 32);
                const dotMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
                const dotMesh = new THREE.Mesh(dotGeo, dotMat);
                dotMesh.rotation.x = -Math.PI / 2;
                userGpsBeacon.add(dotMesh);

                // Pulse light
                const light = new THREE.PointLight(0x38bdf8, 2, 8);
                light.position.y = 1.0;
                userGpsBeacon.add(light);

                scene.add(userGpsBeacon);

                // Create floating HTML pin
                userGpsPinEl = document.createElement('div');
                userGpsPinEl.className = 'absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full';
                userGpsPinEl.innerHTML = `
                    <div class="px-2.5 py-1 rounded-full bg-sky-600 text-white text-[11px] font-heading font-bold shadow-xl border border-sky-300 flex items-center gap-1 animate-bounce">
                        <i class="fa-solid fa-person text-xs"></i> <span>คุณอยู่ที่นี่</span>
                    </div>
                `;
                const container = document.getElementById('pins-container');
                if (container) container.appendChild(userGpsPinEl);
            }

            userGpsBeacon.position.set(dx, 0.12, dz);
            userGpsBeacon.visible = true;
            if (userGpsPinEl) userGpsPinEl.style.display = 'block';

            if (distFromCenter <= 400) {
                // Inside or close to campus
                camTargetState.target.set(dx, 0, dz);
                camTargetState.radius = 35;
                camTargetState.theta = -Math.PI / 4;
                camTargetState.phi = 0.55;
                showToast(`📍 พบตำแหน่งของคุณแล้ว (ความแม่นยำ ±${accuracy} ม.) ห่างจากศูนย์กลาง สสจ. ${Math.round(distFromCenter)} ม.`);
            } else {
                // Outside campus
                const distKm = (distFromCenter / 1000).toFixed(1);
                showToast(`📍 คุณอยู่นอกพื้นที่ สสจ.มุกดาหาร (ห่างออกไป ${distKm} กม.) — กำลังแสดงภาพจำลองสถานที่`);
                camTargetState.target.set(0, 0, 0);
                camTargetState.radius = 65;
            }
            forceRender = true;
        },
        (err) => {
            if (btn) {
                btn.classList.remove('animate-pulse');
                const span = btn.querySelector('span');
                if (span) span.textContent = 'ตำแหน่งฉัน (GPS)';
            }
            let msg = 'ไม่สามารถระบุพิกัด GPS ได้';
            if (err.code === 1) msg = 'กรุณาอนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่ง GPS';
            else if (err.code === 2) msg = 'ไม่พบสัญญาณดาวเทียม GPS';
            else if (err.code === 3) msg = 'หมดเวลาค้นหาสัญญาณ GPS';
            showToast(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}
window.locateUserGPS = locateUserGPS;

function setTopDownSatelliteView() {
    if (satellitePlane) {
        satellitePlane.visible = true;
        const btn = document.getElementById('btn-satellite-toggle');
        if (btn) {
            btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-400');
            btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-600');
            const textSpan = btn.querySelector('span');
            if (textSpan) textSpan.textContent = 'ดาวเทียม: เปิด';
        }
    }
    camTargetState.radius = 70;
    camTargetState.theta = 0;
    camTargetState.phi = 0.08;
    camTargetState.target.set(0, 0, 0);
    forceRender = true;
    showToast('🛰️ มุมมองผังดาวเทียมแนวตั้ง 90° (Top-Down Ortho View)');
}

function toggleDaylightTheme() {
    isDaylightSky = !isDaylightSky;
    if (skyDomeMesh) skyDomeMesh.visible = isDaylightSky;
    scene.background = new THREE.Color(isDaylightSky ? 0x60a5fa : 0x0f172a);
    document.getElementById('sky-mode-label').textContent = t(isDaylightSky ? 'sky.day' : 'sky.night');
}

function toggleAppFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}
window.toggleAppFullscreen = toggleAppFullscreen;

function toggleMiniMapCollapse() {
    const body = document.getElementById('minimap-body');
    const icon = document.getElementById('minimap-toggle-icon');
    body.classList.toggle('hidden');
    icon.className = body.classList.contains('hidden') ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
}

let isSidebarOpen = true;

function toggleSidebar(forceState) {
    const sidebar = document.getElementById('sidebar-panel');
    const openBtn = document.getElementById('btn-expand-sidebar');
    if (!sidebar) return;

    if (typeof forceState === 'boolean') {
        isSidebarOpen = forceState;
    } else {
        isSidebarOpen = !isSidebarOpen;
    }

    if (isSidebarOpen) {
        sidebar.classList.remove('is-collapsed');
        if (openBtn) {
            openBtn.classList.remove('btn-visible');
            openBtn.classList.add('btn-hidden');
            setTimeout(() => {
                if (isSidebarOpen && openBtn) {
                    openBtn.classList.add('hidden');
                }
            }, 200);
        }
    } else {
        sidebar.classList.add('is-collapsed');
        if (openBtn) {
            openBtn.classList.remove('hidden');
            void openBtn.offsetWidth;
            openBtn.classList.remove('btn-hidden');
            openBtn.classList.add('btn-visible');
        }
    }
}

let isLeftPanelOpen = true;

function toggleLeftPanel(forceState) {
    const panel = document.getElementById('left-spots-panel');
    const openBtn = document.getElementById('btn-expand-left-panel');
    if (!panel) return;

    if (typeof forceState === 'boolean') {
        isLeftPanelOpen = forceState;
    } else {
        isLeftPanelOpen = !isLeftPanelOpen;
    }

    if (isLeftPanelOpen) {
        panel.classList.remove('is-collapsed');
        if (openBtn) {
            openBtn.classList.remove('btn-visible');
            openBtn.classList.add('btn-hidden');
            setTimeout(() => {
                if (isLeftPanelOpen && openBtn) {
                    openBtn.classList.add('hidden');
                }
            }, 200);
        }
    } else {
        panel.classList.add('is-collapsed');
        if (openBtn) {
            openBtn.classList.remove('hidden');
            void openBtn.offsetWidth;
            openBtn.classList.remove('btn-hidden');
            openBtn.classList.add('btn-visible');
        }
    }
}

window.toggleLeftPanel = toggleLeftPanel;

function toggleRoomDetailBody(forceState) {
    const body = document.getElementById('room-detail-body');
    const icon = document.getElementById('icon-toggle-room-detail');
    const textSpan = document.getElementById('text-toggle-room-detail');
    if (!body) return;

    const isCurrentlyCollapsed = body.classList.contains('is-collapsed');
    const shouldCollapse = (typeof forceState === 'boolean') ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
        body.classList.add('is-collapsed');
        if (icon) icon.className = 'fa-solid fa-chevron-down text-[10px]';
        if (textSpan) textSpan.textContent = t('room.expand');
    } else {
        body.classList.remove('is-collapsed');
        if (icon) icon.className = 'fa-solid fa-chevron-up text-[10px]';
        if (textSpan) textSpan.textContent = t('room.minimize');
    }
}

// Expose to window explicitly so inline onclick always reaches them
window.toggleSidebar = toggleSidebar;
window.toggleRoomDetailBody = toggleRoomDetailBody;

function renderDirectoryList() {
    const listEl = document.getElementById('directory-list');
    const q = (document.getElementById('dir-search').value || '').trim().toLowerCase();

    // While searching, ignore floor/building filters: visitors expect search to find everything.
    const hitService = {};
    const filtered = ROOMS_DB.filter(r => {
        if (q) {
            const kw = (SERVICES_BY_ROOM[r.id] || []).find(k => k.toLowerCase().includes(q));
            if (kw) hitService[r.id] = kw;
            return kw || [r.name, r.nameEn, r.roomNo, r.head, r.desc, r.descEn, r.phone].some(v => String(v || '').toLowerCase().includes(q));
        }
        const matchFloor = (currentFloorFilter === 'ALL' || r.floor === currentFloorFilter);
        const matchBld = (currentBuildingFilter === 'ALL' || r.building === currentBuildingFilter);
        return matchFloor && matchBld;
    });

    document.getElementById('dir-count-badge').textContent = t('dir.count', { n: filtered.length });
    lastSearchResultCount = filtered.length;

    listEl.innerHTML = filtered.map(r => {
        const isSel = r.id === selectedRoomId;
        const busy = currentBooking(r.id);
        return `
            <div role="button" tabindex="0" data-room-id="${escapeHtml(r.id)}" aria-pressed="${isSel}"
                 class="dir-item p-2.5 rounded-xl border transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${isSel ? 'bg-emerald-950/80 border-emerald-400 shadow-md' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'}">
                <div class="flex items-center justify-between text-[10px] font-heading">
                    <span class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">${escapeHtml(bldShort(r.building))} • ${escapeHtml(t('floor.n', { n: r.floor }))}</span>
                    <span class="text-amber-300 font-semibold">${escapeHtml(t('room.n', { n: r.roomNo }))}${r.phone ? ` (${escapeHtml(r.phone)})` : ''}</span>
                </div>
                <div class="text-xs font-heading font-bold text-white mt-1 leading-snug">${escapeHtml(roomName(r))}</div>
                <div class="text-[11px] text-slate-400 truncate mt-0.5">${escapeHtml(r.head)}</div>
                ${busy ? `<div class="text-[11px] text-rose-300 mt-0.5"><i class="fa-solid fa-circle mr-1 text-[8px]"></i>${escapeHtml(t('booking.busyShort', { until: fmtTime(busy.endsAt) }))}</div>` : ''}
                ${hitService[r.id] ? `<div class="text-[11px] text-sky-300 mt-0.5"><i class="fa-solid fa-circle-check mr-1"></i>${escapeHtml(hitService[r.id])}</div>` : ''}
            </div>
        `;
    }).join('') || `<div class="text-xs text-slate-400 p-3 text-center">${escapeHtml(t('dir.empty'))}</div>`;
}

// Directory list: one delegated handler (click + Enter/Space) instead of inline onclick
function setupDirectoryListEvents() {
    const listEl = document.getElementById('directory-list');
    const pick = (e) => {
        const item = e.target.closest('.dir-item');
        if (item) focusRoom3D(item.dataset.roomId);
    };
    listEl.addEventListener('click', pick);
    listEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
}

// Deep link: ?room=R441 opens that room (for QR codes on doors / signage)
function syncRoomToUrl(roomId) {
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomId);
        history.replaceState(null, '', url);
    } catch (_) { /* file:// or sandboxed iframe: ignore */ }
}

function openRoomFromUrl() {
    const id = new URLSearchParams(window.location.search).get('room');
    if (id && ROOMS_DB.some(r => r.id === id)) focusRoom3D(id);
}

// ============================================================================
// I18N: Thai (default) / English. Static markup uses data-i18n / data-i18n-placeholder;
// data fields fall back to Thai when the English column is empty.
// To add a language: add a dict below + a button option; data needs *_xx columns (see docs).
// ============================================================================
const I18N = {
    th: {
        org: 'สำนักงานสาธารณสุขจังหวัดมุกดาหาร', tagline: 'ระบบผังอาคาร 3 มิติ และค้นหากลุ่มงานอัจฉริยะ',
        'floor.pick': 'เลือกชั้น:', 'floor.all': 'ทุกชั้น', 'floor.1': 'ชั้น 1', 'floor.2': 'ชั้น 2', 'floor.2b': 'ชั้น 2 (ทางเชื่อม)',
        'floor.3': 'ชั้น 3', 'floor.4': 'ชั้น 4', 'floor.n': 'ชั้น {n}', 'room.n': 'ห้อง {n}',
        'mode.exterior': 'นอกอาคารจริง', 'mode.hybrid': 'กึ่งโปร่งใส', 'mode.interior': 'ผังห้องภายใน',
        staff: 'เจ้าหน้าที่', 'sky.day': 'ท้องฟ้าจริง', 'sky.night': 'โหมดมืด',
        'sidebar.title': 'ข้อมูลห้อง & บริการ', 'sidebar.open': 'เปิดข้อมูลห้อง & ค้นหา', 'sidebar.close': 'พับแถบข้าง',
        'room.toggle': 'ย่อ/ขยายเนื้อหาห้อง', 'room.expand': 'ขยาย', 'room.minimize': 'ย่อ',
        'bld.all': 'ภาพรวม', 'bld.2F': 'ตึกหน้า 2F (สีฟ้า)', 'bld.4F': 'ตึกหลัง 4F (สีขาว-เขียว)', 'bld.bridge': 'ทางเชื่อมชั้น 2', 'bld.TTM': 'แพทย์แผนไทย',
        explode: 'แยกชั้น:', 'route.clear': 'ปิดนำทาง', 'route.go': 'นำทาง 3D ไปห้องนี้', 'route.from': 'เริ่มจาก',
        'route.front': 'ทางเข้าหน้าสำนักงาน', 'route.back': 'ประตูหลัง ถนนชาภูบาล', 'route.nostairs': 'ไม่ใช้บันได',
        'route.none': 'ไม่พบเส้นทางไปห้องนี้',
        'route.noAccessible': 'ไม่มีเส้นทางที่ไม่ใช้บันไดไปห้องนี้ กรุณาติดต่อจุดประชาสัมพันธ์ ชั้น 1 ตึกหน้า เจ้าหน้าที่จะลงมาอำนวยความสะดวก',
        'step.start': 'เริ่มที่ {place}', 'step.up': 'ขึ้นบันได ไปชั้น {n}', 'step.down': 'ลงบันได ไปชั้น {n}',
        'step.liftUp': 'ขึ้นลิฟต์ ไปชั้น {n}', 'step.liftDown': 'ลงลิฟต์ ไปชั้น {n}',
        'step.enter': 'เข้า{place}', 'step.bridge': 'เดินข้ามทางเชื่อมชั้น 2 ไปตึกหลัง', 'step.via': 'ผ่าน{place}',
        'step.arrive': 'ถึง {name} (ห้อง {n})',
        'search.ph': 'ค้นหากลุ่มงาน หรือเรื่องที่มาติดต่อ เช่น ร้านยา, บัตรทอง', 'dir.title': 'รายการกลุ่มงาน/จุดบริการทั้งหมด',
        'dir.count': '{n} หน่วยงาน', 'dir.empty': 'ไม่พบ ลองพิมพ์เรื่องที่มาติดต่อ เช่น "ร้านยา", "บัตรทอง"',
        'booking.busy': 'กำลังใช้งาน: {title} (ถึง {until} น.)', 'booking.busyShort': 'กำลังใช้งาน ถึง {until} น.',
        'booking.free': 'ว่างตอนนี้', 'booking.next': 'ถัดไป: {title} {day} {from}-{to} น.', 'booking.today': 'วันนี้',
        'err.3dLoad': 'โหลดโมดูล 3 มิติไม่สำเร็จ ใช้รายชื่อกลุ่มงานด้านข้างค้นหาได้ตามปกติ',
        'err.webgl': 'อุปกรณ์นี้ไม่รองรับการแสดงผล 3 มิติ (WebGL) ใช้รายชื่อกลุ่มงานด้านข้างค้นหาได้ตามปกติ',
        langBtn: 'EN',
    },
    en: {
        org: 'Mukdahan Provincial Public Health Office', tagline: '3D building map & department finder',
        'floor.pick': 'Floor:', 'floor.all': 'All floors', 'floor.1': 'Floor 1', 'floor.2': 'Floor 2', 'floor.2b': 'Floor 2 (bridge)',
        'floor.3': 'Floor 3', 'floor.4': 'Floor 4', 'floor.n': 'Floor {n}', 'room.n': 'Room {n}',
        'mode.exterior': 'Exterior', 'mode.hybrid': 'See-through', 'mode.interior': 'Floor plan',
        staff: 'Staff', 'sky.day': 'Daylight', 'sky.night': 'Dark',
        'sidebar.title': 'Room Info & Services', 'sidebar.open': 'Open Room Info & Directory', 'sidebar.close': 'Hide sidebar',
        'room.toggle': 'Toggle room detail', 'room.expand': 'Expand', 'room.minimize': 'Minimize',
        'bld.all': 'Overview', 'bld.2F': 'Front bldg (2F)', 'bld.4F': 'Rear bldg (4F)', 'bld.bridge': 'Floor-2 bridge', 'bld.TTM': 'Thai medicine',
        explode: 'Separate floors:', 'route.clear': 'Clear route', 'route.go': 'Show route to this room', 'route.from': 'From',
        'route.front': 'Main entrance', 'route.back': 'Back gate (Chaphubal Rd)', 'route.nostairs': 'No stairs',
        'route.none': 'No route found to this room.',
        'route.noAccessible': 'There is no step-free route to this room. Please ask at the information desk, front building floor 1, and staff will come down to assist you.',
        'step.start': 'Start at {place}', 'step.up': 'Take the stairs up to floor {n}', 'step.down': 'Take the stairs down to floor {n}',
        'step.liftUp': 'Take the elevator up to floor {n}', 'step.liftDown': 'Take the elevator down to floor {n}',
        'step.enter': 'Enter the {place}', 'step.bridge': 'Cross the floor-2 bridge to the rear building', 'step.via': 'Go through {place}',
        'step.arrive': 'Arrive at {name} (room {n})',
        'search.ph': 'Search department or service, e.g. pharmacy licence', 'dir.title': 'All departments & service points',
        'dir.count': '{n} units', 'dir.empty': 'Nothing found. Try what you came for, e.g. "pharmacy", "health card".',
        'booking.busy': 'In use: {title} (until {until})', 'booking.busyShort': 'In use until {until}',
        'booking.free': 'Free now', 'booking.next': 'Next: {title} {day} {from}-{to}', 'booking.today': 'today',
        'err.3dLoad': 'Could not load the 3D module. The directory list still works.',
        'err.webgl': 'This device cannot display 3D (WebGL). The directory list still works.',
        langBtn: 'ไทย',
    },
};
const LANGS = Object.keys(I18N);
let LANG = (() => {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (LANGS.includes(fromUrl)) return fromUrl;
    try { const v = localStorage.getItem('ssj3d.lang'); if (LANGS.includes(v)) return v; } catch (_) { /* storage blocked */ }
    return 'th';
})();

function t(key, vars) {
    const s = (I18N[LANG] && I18N[LANG][key]) ?? I18N.th[key] ?? key;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')) : s;
}
const roomName = r => (LANG === 'en' && r.nameEn) || r.name;
const roomDesc = r => (LANG === 'en' && r.descEn) || r.desc;
const bldShort = id => { const b = BUILDINGS_META[id]; return b ? ((LANG === 'en' && b.shortNameEn) || b.shortName) : id; };
const nodeLabel = n => (LANG === 'en' && n.labelEn) || n.label;

function applyI18n() {
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    const btn = document.getElementById('btn-lang');
    if (btn) btn.textContent = t('langBtn');
    const sky = document.getElementById('sky-mode-label');
    if (sky) sky.textContent = t(isDaylightSky ? 'sky.day' : 'sky.night');
}

function setLang(lang) {
    LANG = LANGS.includes(lang) ? lang : 'th';
    try { localStorage.setItem('ssj3d.lang', LANG); } catch (_) { /* storage blocked */ }
    applyI18n();
    const room = ROOMS_DB.find(r => r.id === selectedRoomId);
    if (room) renderRoomDetail(room);
    renderDirectoryList();
    if (wayfindingGroup) draw3DWayfindingToSelected();
    buildHTMLPinsIfReady();
}

function buildHTMLPinsIfReady() {
    if (typeof buildHTMLPins === 'function' && renderer) { buildHTMLPins(); requestRender(); }
}

// ============================================================================
// MEETING-ROOM BOOKINGS (from snapshot). Status is computed from the clock.
// ============================================================================
let BOOKINGS = [];
const fmtTime = iso => new Date(iso).toLocaleTimeString(LANG === 'en' ? 'en-GB' : 'th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
const fmtDay = iso => {
    const d = new Date(iso);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    if (d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === today) return t('booking.today');
    return d.toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' });
};

function currentBooking(roomId, now = Date.now()) {
    return BOOKINGS.find(b => b.roomId === roomId && Date.parse(b.startsAt) <= now && now < Date.parse(b.endsAt)) || null;
}
function nextBooking(roomId, now = Date.now()) {
    return BOOKINGS.find(b => b.roomId === roomId && Date.parse(b.startsAt) > now) || null;
}

function renderBookingStatus(room) {
    const el = document.getElementById('detail-booking');
    if (!el) return;
    const hasAny = BOOKINGS.some(b => b.roomId === room.id) || room.type === 'meeting';
    if (!hasAny) { el.classList.add('hidden'); return; }
    const cur = currentBooking(room.id);
    const nxt = nextBooking(room.id);
    const lines = [cur
        ? t('booking.busy', { title: cur.title, until: fmtTime(cur.endsAt) })
        : t('booking.free')];
    if (nxt) lines.push(t('booking.next', { title: nxt.title, day: fmtDay(nxt.startsAt), from: fmtTime(nxt.startsAt), to: fmtTime(nxt.endsAt) }));
    el.textContent = lines.join(' · ');
    el.className = `mt-1.5 text-xs font-heading rounded-lg px-2 py-1 ${cur ? 'bg-rose-500/15 text-rose-200 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30'}`;
}

// ============================================================================
// ANONYMOUS SEARCH STATS: one POST per finished query (1.5 s after typing stops).
// Server stores only the normalised text + daily counts; never IP or user.
// ============================================================================
let lastSearchResultCount = 0;
function setupSearchLogging() {
    const input = document.getElementById('dir-search');
    if (!input) return;
    let timer = 0, lastSent = '';
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const q = input.value.trim();
            if (q.length < 2 || q === lastSent) return;
            lastSent = q;
            fetch('api/v1/search-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: q.slice(0, 200), results: lastSearchResultCount }),
                keepalive: true,
            }).catch(() => { /* offline / static hosting: stats are best-effort */ });
        }, 1500);
    });
}

// ============================================================================
// DATA: snapshot from API, else static fallback, else the embedded ROOMS_DB above.
// ============================================================================
let NAV = null;
let SERVICES_BY_ROOM = {};
const DATA_SOURCES = ['api/v1/snapshot', 'data/snapshot.json'];

async function fetchJson(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(t);
    }
}

function isValidSnapshot(s) {
    return s && Array.isArray(s.rooms) && s.rooms.length > 0 &&
        s.rooms.every(r => r && typeof r.id === 'string' && typeof r.building === 'string' &&
            Number.isFinite(r.floor) && Number.isFinite(r.lx) && Number.isFinite(r.lz));
}

function applySnapshot(s) {
    // Dynamic building metadata from Database / API snapshot
    if (Array.isArray(s.buildings)) {
        const activeIds = new Set(s.buildings.map(b => b.id));
        // Remove buildings that were deleted from DB
        Object.keys(BUILDINGS_META).forEach(id => {
            if (!activeIds.has(id)) {
                delete BUILDINGS_META[id];
            }
        });

        s.buildings.forEach(b => {
            let col = 0x10b981;
            if (typeof b.color === 'string' && b.color.startsWith('#')) {
                col = parseInt(b.color.substring(1), 16);
            } else if (BUILDINGS_META[b.id]?.color) {
                col = BUILDINGS_META[b.id].color;
            }

            if (!BUILDINGS_META[b.id]) {
                BUILDINGS_META[b.id] = {
                    id: b.id,
                    name: b.name,
                    shortName: b.shortName,
                    nameEn: b.nameEn || '',
                    shortNameEn: b.shortNameEn || '',
                    floors: b.floors || 1,
                    centerX: Number.isFinite(b.centerX) ? b.centerX : 0,
                    centerZ: Number.isFinite(b.centerZ) ? b.centerZ : 0,
                    width: Number.isFinite(b.width) ? b.width : 16,
                    depth: Number.isFinite(b.depth) ? b.depth : 10,
                    rotY: Number.isFinite(b.rotY) ? b.rotY : 0,
                    color: col
                };
            } else {
                Object.assign(BUILDINGS_META[b.id], {
                    name: b.name,
                    shortName: b.shortName,
                    nameEn: b.nameEn || '',
                    shortNameEn: b.shortNameEn || '',
                    floors: b.floors || BUILDINGS_META[b.id].floors,
                    centerX: Number.isFinite(b.centerX) ? b.centerX : BUILDINGS_META[b.id].centerX,
                    centerZ: Number.isFinite(b.centerZ) ? b.centerZ : BUILDINGS_META[b.id].centerZ,
                    width: Number.isFinite(b.width) ? b.width : BUILDINGS_META[b.id].width,
                    depth: Number.isFinite(b.depth) ? b.depth : BUILDINGS_META[b.id].depth,
                    rotY: Number.isFinite(b.rotY) ? b.rotY : BUILDINGS_META[b.id].rotY,
                    color: col
                });
            }
        });
    }
    BOOKINGS = Array.isArray(s.bookings) ? s.bookings : [];
    ROOMS_DB = s.rooms
        .filter(r => BUILDINGS_META[r.building] && r.floor >= 1 && r.floor <= BUILDINGS_META[r.building].floors)
        .map(r => ({ head: '', phone: '', desc: '', type: 'admin', w: 5, d: 5, ...r }));
    SERVICES_BY_ROOM = {};
    (s.services || []).forEach(sv => (SERVICES_BY_ROOM[sv.roomId] ||= []).push(sv.keyword));
    NAV = s.nav && Array.isArray(s.nav.nodes) && s.nav.nodes.length && Array.isArray(s.nav.edges) ? s.nav : null;
    renderBuildingFocusButtons();
}

async function loadSnapshot() {
    for (const url of DATA_SOURCES) {
        try {
            const s = await fetchJson(url, 5000);
            if (isValidSnapshot(s)) { applySnapshot(s); return url; }
            console.warn('invalid snapshot from', url);
        } catch (err) {
            console.warn('snapshot unavailable:', err.message);
        }
    }
    return 'embedded';
}

// ============================================================================
// KIOSK MODE (?kiosk=1): no staff link, no URL rewriting, auto-reset after idle.
// ============================================================================
const IS_KIOSK = new URLSearchParams(window.location.search).get('kiosk') === '1';
const KIOSK_IDLE_MS = 120000;

function resetKiosk() {
    const search = document.getElementById('dir-search');
    if (search) search.value = '';
    clearWayfinding3D();
    if (renderer) {
        select3DFloor('ALL');
        setExteriorMode('realistic');
    }
    focusBuilding3D('ALL');
    closePhotoCompareCard();
    renderDirectoryList();
}

function setupKiosk() {
    if (!IS_KIOSK) return;
    document.documentElement.classList.add('kiosk');
    document.querySelectorAll('[data-hide-in-kiosk]').forEach(el => el.remove());
    let timer = 0;
    const arm = () => { clearTimeout(timer); timer = setTimeout(resetKiosk, KIOSK_IDLE_MS); };
    ['pointerdown', 'keydown', 'wheel'].forEach(ev => window.addEventListener(ev, arm, { passive: true }));
    window.addEventListener('contextmenu', e => e.preventDefault());
    arm();
}

// Start 3D App on Window Load
window.addEventListener('load', async () => {
    setupKiosk();
    applyI18n();
    document.getElementById('btn-lang')?.addEventListener('click', () => setLang(LANG === 'th' ? 'en' : 'th'));
    setupSearchLogging();
    await loadSnapshot();

    // Booking status changes with the clock; data (bookings, edits) refreshes every 5 min (ETag makes it cheap).
    setInterval(() => {
        const room = ROOMS_DB.find(r => r.id === selectedRoomId);
        if (room) renderBookingStatus(room);
        renderDirectoryList();
    }, 60000);
    setInterval(async () => {
        if (document.hidden) return;
        const src = await loadSnapshot();
        if (src === 'embedded') return;
        const room = ROOMS_DB.find(r => r.id === selectedRoomId);
        if (room) renderRoomDetail(room);
        renderDirectoryList();
    }, 300000);
    if (!ROOMS_DB.some(r => r.id === selectedRoomId) && ROOMS_DB.length) selectedRoomId = ROOMS_DB[0].id;
    const initialRoom = ROOMS_DB.find(r => r.id === selectedRoomId);
    if (initialRoom) renderRoomDetail(initialRoom);

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
    }

    if (typeof THREE === 'undefined') {
        document.getElementById('canvas-container').innerHTML =
            `<div class="p-6 text-center text-amber-300 font-heading">${escapeHtml(t('err.3dLoad'))}</div>`;
    } else {
        try {
            init3DScene();
        } catch (err) {
            console.error('3D init failed', err);
            document.getElementById('canvas-container').innerHTML =
                `<div class="p-6 text-center text-amber-300 font-heading">${escapeHtml(t('err.webgl'))}</div>`;
        }
    }
    setupDirectoryListEvents();
    renderDirectoryList();
    if (renderer) openRoomFromUrl();
});
