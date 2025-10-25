import {
  BedStatus,
  BedType,
  Gender,
  GenderRequirement,
  RoomStatus,
  RoomType
} from '~/types/enums/enums';
import { db } from '../database';
import { PatientStatus } from '~/types/models/patient';
import { WardStatus } from '~/types/models/ward';

// 病区配置 - 扩展为更多科室，总床位数约500张
const wardConfigs = [
  // 内科系统
    {
      id: 1,
      code: 'W-01',
    name: '心血管内科',
      department: '内科',
      floor: 3,
      building: 'A栋',
    description: '心血管内科病区',
    roomCount: 25,
    bedsPerRoom: 3,
    totalStaff: 30,
    doctorCount: 10,
    nurseCount: 20
    },
    {
      id: 2,
      code: 'W-02',
    name: '呼吸内科',
    department: '内科',
    floor: 4,
    building: 'A栋',
    description: '呼吸内科病区',
    roomCount: 20,
    bedsPerRoom: 3,
    totalStaff: 25,
    doctorCount: 8,
    nurseCount: 17
  },
  {
    id: 3,
    code: 'W-03',
    name: '消化内科',
    department: '内科',
    floor: 5,
    building: 'A栋',
    description: '消化内科病区',
    roomCount: 18,
    bedsPerRoom: 3,
    totalStaff: 22,
    doctorCount: 7,
    nurseCount: 15
  },
  {
    id: 4,
    code: 'W-04',
    name: '神经内科',
    department: '内科',
    floor: 6,
    building: 'A栋',
    description: '神经内科病区',
    roomCount: 15,
    bedsPerRoom: 3,
    totalStaff: 20,
    doctorCount: 6,
    nurseCount: 14
  },
  {
    id: 5,
    code: 'W-05',
    name: '内分泌科',
    department: '内科',
    floor: 7,
    building: 'A栋',
    description: '内分泌科病区',
    roomCount: 12,
    bedsPerRoom: 3,
    totalStaff: 16,
    doctorCount: 5,
    nurseCount: 11
  },
  
  // 外科系统
  {
    id: 6,
    code: 'W-06',
    name: '普外科',
    department: '外科',
    floor: 3,
    building: 'B栋',
    description: '普通外科病区',
    roomCount: 22,
    bedsPerRoom: 3,
    totalStaff: 28,
    doctorCount: 9,
    nurseCount: 19
  },
  {
    id: 7,
    code: 'W-07',
    name: '骨科',
      department: '外科',
      floor: 4,
    building: 'B栋',
    description: '骨科病区',
    roomCount: 20,
    bedsPerRoom: 3,
    totalStaff: 25,
    doctorCount: 8,
    nurseCount: 17
  },
  {
    id: 8,
    code: 'W-08',
    name: '神经外科',
    department: '外科',
    floor: 5,
    building: 'B栋',
    description: '神经外科病区',
    roomCount: 15,
    bedsPerRoom: 3,
    totalStaff: 20,
    doctorCount: 6,
    nurseCount: 14
  },
  {
    id: 9,
    code: 'W-09',
    name: '泌尿外科',
    department: '外科',
    floor: 6,
    building: 'B栋',
    description: '泌尿外科病区',
    roomCount: 12,
    bedsPerRoom: 3,
    totalStaff: 16,
    doctorCount: 5,
    nurseCount: 11
  },
  
  // 专科系统
  {
    id: 10,
    code: 'W-10',
    name: '妇产科',
    department: '妇产科',
    floor: 2,
    building: 'C栋',
    description: '妇产科病区',
    roomCount: 18,
    bedsPerRoom: 3,
    totalStaff: 22,
    doctorCount: 7,
    nurseCount: 15
  },
  {
    id: 11,
    code: 'W-11',
    name: '儿科',
    department: '儿科',
    floor: 3,
    building: 'C栋',
    description: '儿科病区',
    roomCount: 15,
    bedsPerRoom: 3,
    totalStaff: 20,
    doctorCount: 6,
    nurseCount: 14
  },
  {
    id: 12,
    code: 'W-12',
    name: '新生儿科',
    department: '儿科',
    floor: 4,
    building: 'C栋',
    description: '新生儿科病区',
    roomCount: 10,
    bedsPerRoom: 2,
    totalStaff: 18,
    doctorCount: 5,
    nurseCount: 13
  },
  {
    id: 13,
    code: 'W-13',
    name: '眼科',
    department: '眼科',
    floor: 5,
    building: 'C栋',
    description: '眼科病区',
    roomCount: 8,
    bedsPerRoom: 3,
    totalStaff: 12,
    doctorCount: 4,
    nurseCount: 8
  },
  {
    id: 14,
    code: 'W-14',
    name: '耳鼻喉科',
    department: '耳鼻喉科',
    floor: 6,
    building: 'C栋',
    description: '耳鼻喉科病区',
    roomCount: 8,
    bedsPerRoom: 3,
    totalStaff: 12,
    doctorCount: 4,
    nurseCount: 8
  },
  
  // 重症监护
  {
    id: 15,
    code: 'W-15',
    name: 'ICU',
    department: '重症医学科',
    floor: 7,
    building: 'A栋',
    description: '重症监护病区',
    roomCount: 12,
    bedsPerRoom: 2,
    totalStaff: 30,
    doctorCount: 8,
    nurseCount: 22
  },
  {
    id: 16,
    code: 'W-16',
    name: 'CCU',
    department: '重症医学科',
    floor: 8,
      building: 'A栋',
    description: '冠心病监护病区',
    roomCount: 8,
    bedsPerRoom: 2,
    totalStaff: 20,
    doctorCount: 6,
    nurseCount: 14
  },
  
  // 肿瘤科
  {
    id: 17,
    code: 'W-17',
    name: '肿瘤内科',
    department: '肿瘤科',
    floor: 7,
    building: 'B栋',
    description: '肿瘤内科病区',
    roomCount: 15,
    bedsPerRoom: 3,
    totalStaff: 20,
    doctorCount: 6,
    nurseCount: 14
  },
  {
    id: 18,
    code: 'W-18',
    name: '肿瘤外科',
    department: '肿瘤科',
    floor: 8,
    building: 'B栋',
    description: '肿瘤外科病区',
    roomCount: 12,
    bedsPerRoom: 3,
    totalStaff: 16,
    doctorCount: 5,
    nurseCount: 11
  },
  
  // 康复科
  {
    id: 19,
    code: 'W-19',
    name: '康复科',
    department: '康复医学科',
    floor: 9,
    building: 'C栋',
    description: '康复医学科病区',
    roomCount: 10,
    bedsPerRoom: 3,
    totalStaff: 15,
    doctorCount: 4,
    nurseCount: 11
  },
  
  // 精神科
  {
    id: 20,
    code: 'W-20',
    name: '精神科',
    department: '精神科',
    floor: 10,
    building: 'C栋',
    description: '精神科病区',
    roomCount: 8,
    bedsPerRoom: 3,
    totalStaff: 15,
    doctorCount: 4,
    nurseCount: 11
  }
];

// 初始化病区数据
const seedWards = async () => {
  const wards = wardConfigs.map(config => ({
    id: config.id,
    code: config.code,
    name: config.name,
    department: config.department,
    floor: config.floor,
    building: config.building,
    description: config.description,
    status: WardStatus.ACTIVE,
    totalRooms: config.roomCount,
    totalBeds: config.roomCount * config.bedsPerRoom,
    availableRooms: 0, // 将在生成房间后计算
    availableBeds: 0, // 将在生成床位后计算
    totalStaff: config.totalStaff,
    doctorCount: config.doctorCount,
    nurseCount: config.nurseCount,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await db.wards.bulkPut(wards);
  return wards;
};

// 初始化房间数据
const seedRooms = async () => {
  const rooms = [];
  let roomId = 1;

  for (const config of wardConfigs) {
    for (let i = 1; i <= config.roomCount; i++) {
      rooms.push({
        id: roomId++,
        wardId: config.id,
        code: `${config.code}-R${i.toString().padStart(2, '0')}`,
        name: `${config.floor}${i.toString().padStart(2, '0')}室`,
        roomNumber: i,
        floor: config.floor,
        type: config.id === 5 ? RoomType.INTENSIVE : RoomType.NORMAL, // ICU为重症病房
        capacity: config.bedsPerRoom,
      status: RoomStatus.AVAILABLE,
      gender: GenderRequirement.ANY,
      hasOxygen: true,
      hasToilet: true,
        hasShower: true,
        hasTV: true,
        hasWifi: true,
        hasAirConditioning: true,
        hasRefrigerator: config.id === 5, // ICU有冰箱
      lastCleanedAt: new Date(),
        lastUpdate: new Date(),
        nextCleaningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后清洁
        equipmentIds: [],
        equipments: [],
        bedIds: [],
        patients: [],
      createdAt: new Date(),
      updatedAt: new Date()
      });
    }
  }

  await db.rooms.bulkPut(rooms);
  return rooms;
};

// 初始化床位数据
const seedBeds = async () => {
  const beds = [];
  let bedId = 1;

  for (const config of wardConfigs) {
    const wardRooms = await db.rooms.where('wardId').equals(config.id).toArray();
    
    for (const room of wardRooms) {
      for (let i = 1; i <= config.bedsPerRoom; i++) {
        beds.push({
          id: bedId++,
          roomId: room.id!,
          code: `${room.code}-B${i.toString().padStart(2, '0')}`,
          name: `${i}号床`,
          status: Math.random() < 0.75 ? BedStatus.OCCUPIED : BedStatus.AVAILABLE, // 75%的床位被占用
          type: config.id === 5 ? BedType.INTENSIVE : BedType.NORMAL,
      hasCall: true,
      lastMaintainedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
        });
      }
    }
  }

  await db.beds.bulkPut(beds);
  return beds;
};

// 初始化患者数据
const seedPatients = async () => {
  const patients = [];
  
  // 获取所有已占用的床位
  const occupiedBeds = await db.beds.where('status').equals(BedStatus.OCCUPIED).toArray();
  
  const patientNames = [
    '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十',
    '冯十一', '陈十二', '褚十三', '卫十四', '蒋十五', '沈十六', '韩十七', '杨十八',
    '朱十九', '秦二十', '尤二一', '许二二', '何二三', '吕二四', '施二五', '张二六',
    '孔二七', '曹二八', '严二九', '华三十', '金三一', '魏三二', '陶三三', '姜三四',
    '谢三五', '邹三六', '喻三七', '柏三八', '水三九', '窦四十', '章四一', '云四二',
    '苏四三', '潘四四', '葛四五', '奚四六', '范四七', '彭四八', '郎四九', '鲁五十',
    '韦五一', '昌五二', '马五三', '苗五四', '凤五五', '花五六', '方五七', '俞五八',
    '任五九', '袁六十', '柳六一', '酆六二', '鲍六三', '史六四', '唐六五', '费六六',
    '廉六七', '岑六八', '薛六九', '雷七十', '贺七一', '倪七二', '汤七三', '滕七四',
    '殷七五', '罗七六', '毕七七', '郝七八', '邬七九', '安八十', '常八一', '乐八二',
    '于八三', '时八四', '傅八五', '皮八六', '卞八七', '齐八八', '康八九', '伍九十',
    '余九一', '元九二', '卜九三', '顾九四', '孟九五', '平九六', '黄九七', '和九八',
    '穆九九', '萧一百', '尹一零一', '姚一零二', '邵一零三', '湛一零四', '汪一零五', '祁一零六',
    '毛一零七', '禹一零八', '狄一零九', '米一一零', '贝一一一', '明一一二', '臧一一三', '计一一四',
    '伏一一五', '成一一六', '戴一一七', '谈一一八', '宋一一九', '茅一二零', '庞一二一', '熊一二二',
    '纪一二三', '舒一二四', '屈一二五', '项一二六', '祝一二七', '董一二八', '梁一二九', '杜一三零',
    '阮一三一', '蓝一三二', '闵一三三', '席一三四', '季一三五', '麻一三六', '强一三七', '贾一三八',
    '路一三九', '娄一四零', '危一四一', '江一四二', '童一四三', '颜一四四', '郭一四五', '梅一四六',
    '盛一四七', '林一四八', '刁一四九', '钟一五零', '徐一五一', '邱一五二', '骆一五三', '高一一五四',
    '夏一五五', '蔡一五六', '田一五七', '樊一五八', '胡一五九', '凌一六零', '霍一六一', '虞一六二',
    '万一六三', '支一六四', '柯一六五', '昝一六六', '管一六七', '卢一六八', '莫一六九', '经一七零',
    '房一七一', '裘一七二', '缪一七三', '干一七四', '解一七五', '应一七六', '宗一七七', '丁一七八',
    '宣一七九', '贲一八零', '邓一八一', '郁一八二', '单一八三', '杭一八四', '洪一八五', '包一八六',
    '诸一八七', '左一八八', '石一八九', '崔一九零', '吉一九一', '钮一九二', '龚一九三', '程一九四',
    '嵇一九五', '邢一九六', '滑一九七', '裴一九八', '陆一九九', '荣二零零', '翁二零一', '荀二零二',
    '羊二零三', '於二零四', '惠二零五', '甄二零六', '曲二零七', '家二零八', '封二零九', '芮二一零',
    '羿二一一', '储二一二', '靳二一三', '汲二一四', '邴二一五', '糜二一六', '松二一七', '井二一八',
    '段二一九', '富二二零', '巫二二一', '乌二二二', '焦二二三', '巴二二四', '弓二二五', '牧二二六',
    '隗二二七', '山二二八', '谷二二九', '车二三零', '侯二三一', '宓二三二', '蓬二三三', '全二三四',
    '班二三五', '仰二三六', '秋二三七', '仲二三八', '伊二三九', '宫二四零', '宁二四一', '仇二四二',
    '栾二四三', '暴二四四', '甘二四五', '钭二四六', '厉二四七', '戎二四八', '祖二四九', '武二五零',
    '符二五一', '刘二五二', '景二五三', '詹二五四', '束二五五', '龙二五六', '叶二五七', '幸二五八',
    '司二五九', '韶二六零', '郜二六一', '黎二六二', '蓟二六三', '薄二六四', '印二六五', '宿二六六',
    '白二六七', '怀二六八', '蒲二六九', '邰二七零', '从二七一', '鄂二七二', '索二七三', '咸二七四',
    '籍二七五', '赖二七六', '卓二七七', '蔺二七八', '屠二七九', '蒙二八零', '池二八一', '乔二八二',
    '阴二八三', '郁二八四', '胥二八五', '能二八六', '苍二八七', '双二八八', '闻二八九', '莘二九零',
    '党二九一', '翟二九二', '谭二九三', '贡二九四', '劳二九五', '逄二九六', '姬二九七', '申二九八',
    '扶二九九', '堵三零零', '冉三零一', '宰三零二', '郦三零三', '雍三零四', '郤三零五', '璩三零六',
    '桑三零七', '桂三零八', '濮三零九', '牛三一零', '寿三一一', '通三一二', '边三一三', '扈三一四',
    '燕三一五', '冀三一六', '郏三一七', '浦三一八', '尚三一九', '农三二零', '温三二一', '别三二二',
    '庄三二三', '晏三二四', '柴三二五', '瞿三二六', '阎三二七', '充三二八', '慕三二九', '连三三零',
    '茹三三一', '习三三二', '宦三三三', '艾三三四', '鱼三三五', '容三三六', '向三三七', '古三三八',
    '易三三九', '慎三四零', '戈三四一', '廖三四二', '庾三四三', '终三四四', '暨三四五', '居三四六',
    '衡三四七', '步三四八', '都三四九', '耿三五零', '满三五一', '弘三五二', '匡三五三', '国三五四',
    '文三五五', '寇三五六', '广三五七', '禄三五八', '阙三五九', '东三六零', '欧三六一', '殳三六二',
    '沃三六三', '利三六四', '蔚三六五', '越三六六', '夔三六七', '隆三六八', '师三六九', '巩三七零',
    '厍三七一', '聂三七二', '晁三七三', '勾三七四', '敖三七五', '融三七六', '冷三七七', '訾三七八',
    '辛三七九', '阚三八零', '那三八一', '简三八二', '饶三八三', '空三八四', '曾三八五', '毋三八六',
    '沙三八七', '乜三八八', '养三八九', '鞠三九零', '须三九一', '丰三九二', '巢三九三', '关三九四',
    '蒯三九五', '相三九六', '查三九七', '后三九八', '荆三九九', '红四零零', '游四零一', '竺四零二',
    '权四零三', '逯四零四', '盖四零五', '益四零六', '桓四零七', '公四零八', '万俟四零九', '司马四一零',
    '上官四一一', '欧阳四一二', '夏侯四一三', '诸葛四一四', '闻人四一五', '东方四一六', '赫连四一七', '皇甫四一八',
    '尉迟四一九', '公羊四二零', '澹台四二一', '公冶四二二', '宗政四二三', '濮阳四二四', '淳于四二五', '单于四二六',
    '太叔四二七', '申屠四二八', '公孙四二九', '仲孙四三零', '轩辕四三一', '令狐四三二', '钟离四三三', '宇文四三四',
    '长孙四三五', '慕容四三六', '鲜于四三七', '闾丘四三八', '司徒四三九', '司空四四零', '召南四四一', '有琴四四二',
    '梁丘四四三', '左丘四四四', '东郭四四五', '南门四四六', '呼延四四七', '羊舌四四八', '微生四四九', '梁四五零',
    '左四五一', '东四五二', '南四五三', '呼四五四', '羊四五五', '微四五六', '梁四五七', '左四五八',
    '东四五九', '南四六零', '呼四六一', '羊四六二', '微四六三', '梁四六四', '左四六五', '东四六六',
    '南四六七', '呼四六八', '羊四六九', '微四七零', '梁四七一', '左四七二', '东四七三', '南四七四',
    '呼四七五', '羊四七六', '微四七七', '梁四七八', '左四七九', '东四八零', '南四八一', '呼四八二',
    '羊四八三', '微四八四', '梁四八五', '左四八六', '东四八七', '南四八八', '呼四八九', '羊四九零',
    '微四九一', '梁四九二', '左四九三', '东四九四', '南四九五', '呼四九六', '羊四九七', '微四九八',
    '梁四九九', '左五零零'
  ];
  
  const diagnoses = [
    '高血压', '糖尿病', '肺炎', '骨折', '心脏病', '中风', '阑尾炎', '胃炎',
    '肝炎', '肾炎', '哮喘', '贫血', '肿瘤', '感染', '外伤', '慢性病',
    '胆囊炎', '胰腺炎', '脑梗塞', '心肌梗塞', '肺气肿', '支气管炎', '肠炎', '胃溃疡',
    '冠心病', '心律失常', '心力衰竭', '慢性阻塞性肺病', '支气管哮喘', '肺结核', '肺癌', '胃癌',
    '肝癌', '乳腺癌', '结肠癌', '直肠癌', '前列腺癌', '膀胱癌', '肾癌', '甲状腺癌',
    '白血病', '淋巴瘤', '多发性骨髓瘤', '脑瘤', '骨肉瘤', '软组织肉瘤', '黑色素瘤', '皮肤癌',
    '白内障', '青光眼', '视网膜脱离', '黄斑变性', '糖尿病视网膜病变', '视神经炎', '角膜炎', '结膜炎',
    '中耳炎', '鼻窦炎', '扁桃体炎', '声带息肉', '鼻息肉', '过敏性鼻炎', '慢性咽炎', '喉炎',
    '龋齿', '牙周病', '牙龈炎', '口腔溃疡', '舌炎', '腮腺炎', '颞下颌关节紊乱', '口腔癌',
    '颈椎病', '腰椎间盘突出', '骨关节炎', '类风湿关节炎', '强直性脊柱炎', '骨质疏松', '痛风', '风湿病',
    '系统性红斑狼疮', '硬皮病', '皮肌炎', '干燥综合征', '血管炎', '结节性多动脉炎', '韦格纳肉芽肿', '白塞病',
    '抑郁症', '焦虑症', '精神分裂症', '双相情感障碍', '强迫症', '恐惧症', '创伤后应激障碍', '人格障碍',
    '阿尔茨海默病', '帕金森病', '癫痫', '多发性硬化', '肌萎缩侧索硬化', '重症肌无力', '格林巴利综合征', '脊髓炎',
    '脑膜炎', '脑炎', '脑脓肿', '硬膜外血肿', '硬膜下血肿', '蛛网膜下腔出血', '脑出血', '脑血栓',
    '深静脉血栓', '肺栓塞', '动脉硬化', '动脉瘤', '血管畸形', '雷诺病', '血栓闭塞性脉管炎', '静脉曲张',
    '甲状腺功能亢进', '甲状腺功能减退', '甲状腺炎', '甲状腺结节', '甲状腺癌', '甲状旁腺功能亢进', '甲状旁腺功能减退', '肾上腺皮质功能减退',
    '库欣综合征', '原发性醛固酮增多症', '嗜铬细胞瘤', '垂体瘤', '肢端肥大症', '尿崩症', '抗利尿激素分泌异常综合征', '生长激素缺乏症',
    '性早熟', '性发育延迟', '多囊卵巢综合征', '闭经', '月经不调', '不孕症', '习惯性流产', '妊娠高血压',
    '妊娠糖尿病', '前置胎盘', '胎盘早剥', '羊水过多', '羊水过少', '胎儿宫内发育迟缓', '早产', '过期妊娠',
    '新生儿窒息', '新生儿黄疸', '新生儿肺炎', '新生儿败血症', '新生儿脑病', '先天性心脏病', '先天性畸形', '遗传性疾病',
    '营养不良', '肥胖症', '维生素缺乏', '微量元素缺乏', '电解质紊乱', '酸碱平衡失调', '脱水', '水中毒',
    '休克', '多器官功能衰竭', '脓毒症', '感染性休克', '过敏性休克', '心源性休克', '失血性休克', '神经源性休克',
    '烧伤', '冻伤', '中暑', '热射病', '热痉挛', '热衰竭', '冻疮', '冻僵',
    '一氧化碳中毒', '药物中毒', '酒精中毒', '食物中毒', '农药中毒', '重金属中毒', '有机溶剂中毒', '气体中毒',
    '放射病', '辐射损伤', '电击伤', '雷击伤', '溺水', '窒息', '异物吸入', '异物误吞',
    '自伤', '自杀', '他伤', '他杀', '意外伤害', '交通事故', '工伤', '运动损伤',
    '职业性皮肤病', '职业性肺病', '职业性耳聋', '职业性眼病', '职业性中毒', '职业性肿瘤', '职业性传染病', '职业性心理疾病'
  ];
  
  // 生成在院患者（占用床位）
  for (let i = 0; i < occupiedBeds.length; i++) {
    const bed = occupiedBeds[i];
    const room = await db.rooms.get(bed.roomId);
    
    // 循环使用患者姓名和诊断
    const nameIndex = i % patientNames.length;
    const diagnosisIndex = i % diagnoses.length;
    
    // 随机生成入院日期（过去30天内）
    const admissionDaysAgo = Math.floor(Math.random() * 30);
    const admissionDate = new Date(Date.now() - admissionDaysAgo * 24 * 60 * 60 * 1000);
    
    patients.push({
      id: i + 1,
      bedId: bed.id!,
      roomId: room?.id || 1,
      name: patientNames[nameIndex],
      gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
      age: 20 + (i * 7) % 60, // 年龄范围 20-80
      idCard: `310123${1980 + (i % 30)}${(1000 + i).toString().padStart(4, '0')}`,
      phone: `138${(10000000 + i).toString().padStart(8, '0')}`,
      contactName: `紧急联系人${i + 1}`,
      contactPhone: `139${(10000000 + i).toString().padStart(8, '0')}`,
      admissionDate: admissionDate,
      diagnosis: diagnoses[diagnosisIndex],
      status: PatientStatus.ADMITTED,
      notes: `患者${i + 1}的备注信息`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // 生成已出院患者（增加历史数据，让出院人数更多）
  const dischargedPatientCount = Math.floor(occupiedBeds.length * 0.8); // 增加到80%的已出院患者
  for (let i = 0; i < dischargedPatientCount; i++) {
    const nameIndex = (occupiedBeds.length + i) % patientNames.length;
    const diagnosisIndex = (occupiedBeds.length + i) % diagnoses.length;
    
    // 生成更合理的入院和出院日期分布
    const admissionDaysAgo = Math.floor(Math.random() * 90); // 0-90天前入院
    const stayDays = Math.floor(Math.random() * 15) + 2; // 住院2-17天
    const admissionDate = new Date(Date.now() - admissionDaysAgo * 24 * 60 * 60 * 1000);
    const dischargeDate = new Date(admissionDate.getTime() + stayDays * 24 * 60 * 60 * 1000);
    
    // 确保出院日期不超过今天
    if (dischargeDate > new Date()) {
      dischargeDate.setTime(new Date().getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
    }
    
    patients.push({
      id: occupiedBeds.length + i + 1,
      bedId: undefined, // 已出院，没有床位
      roomId: undefined,
      name: patientNames[nameIndex],
      gender: (occupiedBeds.length + i) % 2 === 0 ? Gender.MALE : Gender.FEMALE,
      age: 20 + ((occupiedBeds.length + i) * 7) % 60,
      idCard: `310123${1980 + ((occupiedBeds.length + i) % 30)}${(2000 + i).toString().padStart(4, '0')}`,
      phone: `138${(20000000 + i).toString().padStart(8, '0')}`,
      contactName: `紧急联系人${occupiedBeds.length + i + 1}`,
      contactPhone: `139${(20000000 + i).toString().padStart(8, '0')}`,
      admissionDate: admissionDate,
      dischargeDate: dischargeDate,
      diagnosis: diagnoses[diagnosisIndex],
      status: PatientStatus.DISCHARGED,
      notes: `患者${occupiedBeds.length + i + 1}的备注信息`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    }

  await db.patients.bulkPut(patients);
  return patients;
};

// 更新病区统计数据
const updateWardStats = async () => {
  const wards = await db.wards.toArray();
  
  for (const ward of wards) {
    const wardRooms = await db.rooms.where('wardId').equals(ward.id!).toArray();
    const wardBeds = await db.beds.where('roomId').anyOf(wardRooms.map(r => r.id!)).toArray();
    const occupiedBeds = await db.patients.where('bedId').anyOf(wardBeds.map(b => b.id!)).toArray();
    
    const availableBeds = wardBeds.length - occupiedBeds.length;
    const availableRooms = wardRooms.filter(room => {
      const roomBeds = wardBeds.filter(bed => bed.roomId === room.id);
      const roomOccupiedBeds = occupiedBeds.filter(patient => 
        roomBeds.some(bed => bed.id === patient.bedId)
      );
      return roomOccupiedBeds.length < roomBeds.length;
    }).length;
    
    await db.wards.update(ward.id, {
      totalRooms: wardRooms.length,
      totalBeds: wardBeds.length,
      availableRooms,
      availableBeds,
      updatedAt: new Date()
    });
  }
};

// 执行所有初始化
export const initializeWardData = async () => {
  try {
    console.log('开始初始化病区数据...');
    
    // 清空现有数据
    await db.patients.clear();
    await db.beds.clear();
    await db.rooms.clear();
    await db.wards.clear();
    
    // 按顺序初始化数据
    const wards = await seedWards();
    console.log(`创建了 ${wards.length} 个病区`);
    
    const rooms = await seedRooms();
    console.log(`创建了 ${rooms.length} 个房间`);
    
    const beds = await seedBeds();
    console.log(`创建了 ${beds.length} 个床位`);
    
    const patients = await seedPatients();
    console.log(`创建了 ${patients.length} 个患者`);
    
    // 更新病区统计数据
    await updateWardStats();
    console.log('更新了病区统计数据');
    
    // 验证数据一致性
    const finalWards = await db.wards.toArray();
    const finalRooms = await db.rooms.toArray();
    const finalBeds = await db.beds.toArray();
    const finalPatients = await db.patients.toArray();
    
    console.log('数据验证结果:');
    console.log(`- 病区数: ${finalWards.length}`);
    console.log(`- 房间数: ${finalRooms.length}`);
    console.log(`- 床位总数: ${finalBeds.length}`);
    console.log(`- 已占用床位: ${finalBeds.filter(b => b.status === BedStatus.OCCUPIED).length}`);
    console.log(`- 患者数: ${finalPatients.length}`);
    
    // 验证每个病区的数据
    for (const ward of finalWards) {
      const wardRooms = finalRooms.filter(r => r.wardId === ward.id);
      const wardBeds = finalBeds.filter(b => wardRooms.some(r => r.id === b.roomId));
      const wardPatients = finalPatients.filter(p => wardBeds.some(b => b.id === p.bedId));
      
      console.log(`${ward.name}: 房间${wardRooms.length}/${ward.totalRooms}, 床位${wardBeds.length}/${ward.totalBeds}, 患者${wardPatients.length}`);
    }

    return {
      wards: finalWards,
      rooms: finalRooms,
      beds: finalBeds,
      patients: finalPatients
    };
  } catch (error) {
    console.error('初始化病区数据失败:', error);
    throw error;
  }
};