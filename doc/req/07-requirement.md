# 07 Requirement - 3D SCADA Web Platform

## Version Update Frontend
- Version นี้ update จาก `C:\JectTest\doc\req\06-requirement.md`
- ไฟล์นี้เป็น requirement ฉบับ Version 07 สำหรับโปรเจกต์ `C:\JectTest`
- การเปลี่ยนแปลงหลักจาก version 06:
  - Phase นี้ implement เฉพาะ Frontend ก่อน
  - ยังไม่ต้องทำ Backend
  - ยังไม่ต้องทำ Database
  - ยังไม่ต้องใช้ Prisma ORM / PostgreSQL / TimescaleDB ใน phase นี้
  - การ save/load ใน phase นี้ใช้ browser local state หรือ localStorage/IndexedDB ได้ก่อน
  - การทดสอบ realtime ให้เชื่อม MQTT broker จาก frontend โดยตรงผ่าน MQTT over WebSocket
  - Backend gateway, REST API, database persistence, Prisma, PostgreSQL, TimescaleDB เป็น future/production phase
  - ระบุชัดว่า Tag Config ต้องรองรับ Direct MQTT Topic แบบ plaintext/raw value
  - Direct MQTT Topic รองรับ payload แบบ plaintext/raw value โดยไม่ต้องจับ JSON pattern
  - ระบุชัดว่า version นี้ยังไม่รองรับ Modbus TCP/RTU
  - Authentication / login / signup เป็น future requirement ยังไม่บังคับใน MVP
  - เพิ่ม TanStack Query สำหรับ API/server state
  - ใช้ TanStack Table สำหรับ alarm log / event log / audit log
  - ใช้ React Grid Layout สำหรับ dashboard add panel
  - Backend architecture ยังเก็บไว้เป็นแนวทางอนาคต แต่ไม่อยู่ใน implementation scope ของ phase นี้
  - Database architecture ยังเก็บไว้เป็นแนวทางอนาคต แต่ไม่อยู่ใน implementation scope ของ phase นี้

## 1. จุดประสงค์ของระบบ

ระบบนี้คือ Web-based 3D SCADA / HMI Platform สำหรับสร้างหน้า Monitoring และ Control แบบ 3D Scene โดยผู้ใช้สามารถนำโมเดล 3D, component 2D, tag, alarm, dashboard และ action ต่าง ๆ มาจัดวางบน scene ได้เอง คล้ายแนวคิด Canva/Figma แต่ใช้งานกับงานอุตสาหกรรม, sensor, actuator, machine และ MQTT data source

เป้าหมายหลักคือให้ผู้ใช้สร้าง project SCADA ได้โดยไม่ต้องเขียน code ผู้ใช้สามารถ import model, วาง component, ผูก tag, ตั้ง condition, ตั้ง action, monitor ค่า sensor, control อุปกรณ์, ดู alarm log และสร้าง dashboard ได้จากหน้า web

ระบบต้องรองรับการพัฒนาต่อยอดเป็น product จริง โดยควรออกแบบให้แยกส่วนชัดเจน ไม่รวม logic ทั้งหมดไว้ในไฟล์เดียว เช่น `main.js` เพราะในอนาคตจะมี component, model, tag, alarm, dashboard และ protocol integration เพิ่มขึ้นจำนวนมาก

## 2. ขอบเขตของ Project

ระบบต้องมีความสามารถหลักดังนี้

1. สร้างและจัดการ Project ได้
2. ภายในแต่ละ Project ต้องมี Scene, Alarm Log และ Dashboard
3. มี 3D Scene Editor สำหรับวาง model และ component
4. มี Model Library สำหรับเลือก model 3D มาใช้งาน
5. มี Component Library สำหรับเลือก component 2D/SCADA มาใช้งาน
6. มี Tag Configuration สำหรับกำหนดข้อมูลที่มาจาก MQTT/Sensor
7. Component และ Model สามารถผูก tag ได้
8. Model สามารถมี action ตาม value ของ tag ได้ เช่น rotate, stop
9. มี Alarm Log สำหรับแสดงประวัติ alarm
10. มี Dashboard สำหรับแสดงข้อมูล sensor/status ด้วย chart/gauge
11. รองรับ MQTT over WebSocket สำหรับ MVP/development และควรออกแบบให้ production ใช้ backend gateway เป็นตัวกลาง
12. รองรับ backend gateway สำหรับ MQTT TCP และ PLC protocol ในอนาคต โดย version นี้ยังไม่รองรับ Modbus TCP/RTU
13. มีระบบ Permission แยกสิทธิ์ Watch / Control / Edit
14. มีระบบ UI editor ที่ใช้งานง่าย คล้าย Canva/Figma
15. รองรับการ copy/paste component และ model พร้อม property

## 2.1 Implementation Scope ของ Version 07

Version 07 เป็น frontend-only prototype

ต้องทำใน phase นี้:

- React + Vite + TypeScript frontend
- UI สำหรับ Project Settings, Scene Editor, Tag Config, Alarm Log, Dashboard
- 3D Scene Editor ด้วย Three.js / React Three Fiber
- State management ด้วย Zustand
- MQTT over WebSocket จาก frontend/browser โดยตรง
- Direct MQTT Topic tag แบบ plaintext/raw payload
- Dashboard add panel ด้วย React Grid Layout
- Chart/Gauge ด้วย ECharts หรือ Recharts
- Alarm/Event table ด้วย TanStack Table
- Save/load แบบชั่วคราวใน browser local state หรือ localStorage/IndexedDB

ยังไม่ต้องทำใน phase นี้:

- Backend / NestJS
- REST API จริง
- Backend WebSocket Gateway
- Prisma ORM
- PostgreSQL
- TimescaleDB
- Database persistence จริง
- Authentication / login / signup
- Server-side permission enforcement
- MQTT TCP gateway
- Modbus TCP/RTU

หมายเหตุ:

- ถ้า broker รองรับ MQTT over WebSocket (`ws://` หรือ `wss://`) frontend สามารถเชื่อมต่อเองได้
- ถ้า broker รองรับเฉพาะ MQTT TCP (`mqtt://host:1883`) ต้องรอ backend gateway ใน future phase
- Backend/database section ในไฟล์นี้เป็น architecture สำหรับอนาคต ไม่ใช่ scope ที่ต้อง implement ตอนนี้

## 2.2 User Authentication Scope

- Version นี้ยังไม่ต้องทำ login/signup
- Authentication เป็น future requirement
- MVP ยังไม่ต้องบังคับ login ก่อนเข้าใช้งาน project
- โครงสร้าง database และ backend ควรเตรียมไว้ให้เพิ่ม auth ได้ในอนาคต
- Permission ใน version นี้ให้โฟกัสที่ data model, UI state และ rule structure ก่อน

## 3. User Roles และ Permission

ระบบควรออกแบบโครงสร้างให้รองรับ user login, owner และ collaborator ในอนาคต แต่ version นี้ยังไม่บังคับ login/signup ใน MVP

### 3.1 Owner

Owner คือผู้สร้าง project มีสิทธิ์สูงสุดใน project นั้น

Owner สามารถทำได้:

- แก้ไขชื่อ project
- ลบ project
- เพิ่มหรือลบ user ใน project
- กำหนด permission ของ user แต่ละคน
- แก้ไข MQTT connection
- แก้ไข tag configuration
- แก้ไข scene, component, model, dashboard, alarm
- control อุปกรณ์ทั้งหมดที่ถูกวางไว้ใน scene

### 3.2 Watchable

เหมาะสำหรับผู้ใช้ที่ดูสถานะอย่างเดียว

Watchable สามารถทำได้:

- เปิดดู scene ได้
- เปิดดู dashboard ได้
- เปิดดู alarm log ได้
- เห็นค่า real-time จาก tag ได้
- เห็นสถานะ component/model ได้

Watchable ไม่สามารถทำได้:

- กดปุ่ม control
- ส่งค่า input
- toggle switch
- แก้ไข component
- แก้ไข tag
- แก้ไข MQTT config
- แก้ไข dashboard
- แก้ไข alarm condition

### 3.3 Controlable

เหมาะสำหรับ operator ที่สามารถสั่งงานได้ แต่ไม่แก้ไข layout/config

Controlable สามารถทำได้:

- ทำทุกอย่างที่ Watchable ทำได้
- toggle switch ได้
- กดปุ่ม control ได้
- กรอก input แล้ว publish ไปยัง tag ได้
- acknowledge alarm ได้ ถ้าระบบเปิดให้ใช้งาน

Controlable ไม่สามารถทำได้:

- ย้าย component
- resize component
- import model
- แก้ไข tag binding
- แก้ไข MQTT config
- แก้ไข alarm condition
- แก้ไข dashboard panel
- แก้ไข model action

### 3.4 Editable

เหมาะสำหรับ engineer หรือผู้ดูแลระบบ

Editable สามารถทำได้:

- ทำทุกอย่างที่ Controlable ทำได้
- เพิ่ม/ลบ/ย้าย/resize component
- import และลบ model
- config component
- config tag
- config alarm
- config dashboard
- config model action
- config MQTT connection
- จัดวาง scene
- เปลี่ยน background/grid/camera

## 4. Project Structure ในระบบ

หนึ่ง Project ควรประกอบด้วย:

- Project Settings
- Scene list
- Alarm Log
- Dashboard list
- Tag Configuration
- Connection Configuration
- User Permission

ตัวอย่างโครงสร้างข้อมูล:

```json
{
  "id": "project_001",
  "name": "Smart Factory",
  "type": "MQTTClient",
  "connection": {},
  "tags": [],
  "scenes": [],
  "dashboards": [],
  "alarms": [],
  "users": []
}
```

## 5. Left Sidebar Requirement

Left Sidebar เป็น navigation หลักของระบบ

ต้องมี 2 tab:

- Views
- Toolbox

### 5.1 Views Tab

Views ใช้สำหรับดู project screen

ภายใน Views ต้องมี:

- ปุ่มสร้าง project หรือ scene ด้วย icon `+`
- Project item
- Scene item
- Alarm Log item
- Dashboard item

ตัวอย่าง:

- PROJECT1
  - Scene
  - Alarm Log
  - Dashboard

เมื่อกด Scene:

- แสดง 3D Scene Editor
- แสดง Background Color Control ด้านขวาบน
- Config Sidebar จะแสดงเมื่อมี component/model ถูกเลือกเท่านั้น

เมื่อกด Alarm Log:

- แสดงหน้า Alarm Log เต็มพื้นที่
- ซ่อน 3D viewport tool ที่ไม่เกี่ยวข้อง
- ซ่อน background color control
- ซ่อน config sidebar ถ้าไม่มีความจำเป็น

เมื่อกด Dashboard:

- แสดงหน้า Dashboard เต็มพื้นที่
- มีปุ่ม Add Panel ด้านขวาบน

### 5.2 Toolbox Tab

Toolbox ใช้สำหรับเลือกเครื่องมือหรือ component ไปวางบน scene

แบ่งเป็น 2 หมวดหลักก่อน:

- General
- Model

General ควรมี:

- Select
- Text Label
- Text Output
- Text Input
- Switch
- Image
- Rectangle
- Circle

Model ควรแสดง model จาก model library

การแสดง item ใน toolbox:

- ใช้ icon
- ใช้ชื่อสั้น
- hover แล้วมี visual feedback
- ถ้า component มีหลาย template เช่น switch หลายแบบ ให้ hover แล้วแสดง popup template picker

## 6. 3D Scene Editor Requirement

Scene Editor คือพื้นที่หลักสำหรับจัดวาง model และ component

### 6.1 Scene Background

ต้องมี background color picker อยู่ด้านขวาบนของ scene

ผู้ใช้สามารถเปลี่ยนสี background ได้ เช่น:

- `#f0efeb`
- สีอ่อนสำหรับ industrial isometric scene

Background color picker ควรอยู่แยกจาก config sidebar

### 6.2 Grid / Platform

Scene ต้องมีพื้น grid สำหรับช่วยจัดตำแหน่ง

Requirement:

- พื้นควรเป็นสีอ่อน เช่น `#f0efeb`
- เส้น grid ต้องมองเห็นชัดแต่ไม่รบกวนสายตา
- grid major และ minor ควรแยกสีได้
- platform edge ควรเป็นสีเทาอ่อน/กลาง
- grid ไม่ควรเป็นสีน้ำเงินเข้มถ้า theme เป็นสีอ่อน

ตัวอย่างสี:

- platform: `#f0efeb`
- grid major: `#c7c4bd`
- grid minor: `#d8d5ce`
- edge: `#b8b4ac`

### 6.3 Camera

Camera ต้องใช้งานสะดวกสำหรับวาง model และ component

ต้องรองรับ:

- Orbit
- Pan
- Zoom in/out
- Preset view เช่น front, top, left, right, isometric
- Reset camera
- Save camera position ต่อ scene

กล้องควรมี default แบบ isometric เพื่อให้ scene ดูคล้าย industrial diagram

ตัวอย่าง camera state ที่ควรบันทึก:

```json
{
  "position": { "x": 10, "y": 8, "z": 10 },
  "target": { "x": 0, "y": 0, "z": 0 },
  "zoom": 1
}
```

### 6.4 Object Selection

ผู้ใช้ต้องสามารถเลือก object ใน scene ได้ทั้ง:

- Model หลัก
- Component ย่อยของ model
- Text Label
- Text Output
- Text Input
- Switch
- Image
- Shape

เมื่อเลือก object:

- แสดง selection outline
- แสดง resize handle สำหรับ 2D component
- เปิด config sidebar ด้านขวา
- แสดง property ของ object ที่เลือก

เมื่อไม่ได้เลือก object:

- Config sidebar ต้อง hide

### 6.5 Position / Rotation / Scale

Object ต้องสามารถตั้งค่า position, rotation, scale ได้

Position:

- x
- y
- z

Rotation:

- x
- y
- z

Scale:

- uniform scale
- หรือ scale x/y/z สำหรับ model

Input ต้องกว้างพอให้เห็นตัวเลข เช่น `-123.45`

Step ของ position ควรเป็น `0.1`

### 6.6 Drag and Drop

ผู้ใช้ต้องสามารถลาก item จาก toolbox/model library มาวางใน scene ได้

เมื่อ drop:

- สร้าง object ใน scene
- วางตำแหน่งตามจุดที่ mouse ชี้บน grid
- เลือก object นั้นทันที
- เปิด config sidebar

### 6.7 Smart Alignment Guides

ระบบควรมี smart guides คล้าย Canva/Figma

ใช้สำหรับ:

- ช่วยจัดวาง component ให้ตรงกัน
- snap center
- snap edge
- snap ระยะห่าง
- แสดงเส้น guide ชั่วคราวตอนลาก

Smart guide ควรรองรับ:

- 2D component กับ 2D component
- model กับ model
- model กับ component ถ้าเป็น world anchored component

### 6.8 Copy / Paste

ต้องรองรับ copy/paste ทุก component

วิธีใช้งาน:

- Right click แล้วเลือก Copy
- Right click แล้วเลือก Paste
- หรือ keyboard shortcut `Ctrl+C`, `Ctrl+V`

สิ่งที่ต้อง copy ไปด้วย:

- type
- position
- rotation
- scale
- size
- style
- color
- tag binding
- unit
- action config
- alarm config ถ้ามี
- model material color
- component template type

เมื่อ paste:

- object ใหม่ต้องไม่ทับ object เดิมพอดี
- offset ประมาณ 3 unit ในแกน x หรือ z
- property ต้องเหมือนต้นฉบับทั้งหมด

## 7. Model Library Requirement

Model Library ใช้สำหรับเก็บ model 3D ที่ผู้ใช้สามารถนำไปวางใน scene

### 7.1 Model Format

ควรรองรับ:

- `.glb`
- `.gltf`

ควรแนะนำให้ใช้ `.glb` เพราะรวม geometry, material, texture ไว้ในไฟล์เดียว

### 7.2 Model Metadata

Model Library ควรเก็บ metadata เช่น:

```json
{
  "id": "model_doubledoor",
  "name": "Double Door",
  "file": "door.glb",
  "category": "Building",
  "thumbnail": "door.png",
  "components": ["door", "frame"],
  "actions": []
}
```

### 7.3 Model Import

ผู้ใช้ควรสามารถ import model เข้า library ได้

Requirement:

- ปุ่มควรใช้คำว่า `Import Model`
- มี import icon
- import แล้วเพิ่มเข้า model library
- แสดงชื่อ model ชัดเจน
- มี thumbnail หรือ preview

### 7.4 Model Component / Sub-part

Model บางตัวต้องแยกองค์ประกอบเพื่อให้ config ได้

ตัวอย่าง `Double Door`:

- door
- frame

ถ้า door มีประตูสองบาน, ที่จับ, กระจก, ขอบกระจก แต่ผู้ใช้อยากให้ทั้งหมดเป็น component เดียวชื่อ `door` ต้องจัด group/join ใน Blender ให้เรียบร้อยก่อน export

ถ้า frame มีกรอบ 3 ด้าน แต่ผู้ใช้อยาก config เป็นชิ้นเดียว ต้องจัดให้เป็น component เดียวชื่อ `frame`

ระบบควรอ่านชื่อ component จาก hierarchy ของ GLB โดยตรง ไม่ควรต้องมา hardcode ใน source code ทุกครั้งที่เพิ่ม model ใหม่

### 7.5 Model Material Config

Model component ที่เลือกได้ควรเปลี่ยนสีได้

Requirement:

- เลือก model component เช่น `door`
- เปลี่ยน material color เฉพาะ component นั้น
- ถ้า component หลายตัวใช้ material เดียวกัน ต้อง clone material ก่อนเปลี่ยนสี เพื่อไม่ให้สีเปลี่ยนพร้อมกันโดยไม่ตั้งใจ
- ถ้า model มี texture สีที่ซับซ้อน การเปลี่ยนสีอาจดูเหมือนสีผสมกับ texture เดิม ควรมี option ให้ใช้ plain material สำหรับ component ที่ต้อง config สีง่าย

### 7.6 Model Action Preset

Model แต่ละตัวควรกำหนดไว้ล่วงหน้าว่าสามารถทำ action อะไรได้บ้าง เพื่อป้องกัน user สั่ง action ผิดส่วน

ตัวอย่าง:

```json
{
  "model": "pump",
  "components": [
    {
      "name": "impeller",
      "actions": ["rotateZ", "stop"]
    },
    {
      "name": "body",
      "actions": []
    }
  ]
}
```

เหตุผล:

- บาง model มีหลายชิ้นส่วนที่หมุนได้
- ถ้าให้ user เลือกเองทั้งหมด อาจไม่รู้ว่าต้องหมุนชิ้นไหน
- ผู้พัฒนา model ควร setup action preset ให้ก่อน
- user เห็นเฉพาะ action ที่ model นั้นรองรับ

## 8. Component Library Requirement

Component Library คือชุด component 2D/SCADA ที่สามารถวางใน scene

Component ต้องมี template หลายรูปแบบในอนาคต เช่น:

- switch มีหลายแบบ
- text label มีหลายแบบ
- alarm popup มีหลายแบบ
- gauge มีหลายแบบ
- button มีหลายแบบ

เมื่อ hover component ที่มีหลาย template:

- แสดง popup picker ข้าง ๆ
- ขนาด popup ขึ้นกับจำนวน template
- ตอนนี้ถ้ามี template เดียว ก็แสดง template เดียวก่อน

## 9. 2D Component ใน 3D Scene

2D component เช่น switch, label, input, output ต้องถูกวางใน scene แบบ world anchored

ความหมาย:

- component ยังเป็น 2D UI
- แต่ตำแหน่งอ้างอิงกับ world position ใน 3D scene
- เมื่อ zoom เข้า component ต้องดูใหญ่ขึ้นเหมือน model
- เมื่อ zoom ออก component ต้องดูเล็กลงเหมือน model
- ไม่ใช่ fixed overlay ที่ขนาดเท่าเดิมตลอด

Component ต้องสามารถ:

- click เลือกได้
- drag ย้ายได้
- resize ได้
- config ได้
- copy/paste ได้
- delete ได้
- bind tag ได้

## 10. Resize / Transform Handle Requirement

2D component ต้องมี resize handle คล้าย Canva

Requirement:

- มีกรอบ selection สีม่วง/น้ำเงิน
- มีจุด resize 4 มุม
- มี handle กลางด้านบน/ล่าง/ซ้าย/ขวา
- จุด handle ต้องไม่ใหญ่เกินไป
- เมื่อ component ขนาดเล็ก handle ต้องไม่หลุด frame
- Shift + drag ที่มุม ต้อง resize แบบคงอัตราส่วน
- resize ต้องไม่ทำให้ content หลุดกรอบ

## 11. Text Label Component

Text Label ใช้แสดงข้อความ static บน scene

Config:

- Text
- Font family
- Font size
- Text color
- Background color
- Border color
- Border radius
- Width
- Height
- Position
- Rotation

Default style อาจเป็นป้าย:

- background สีเทาอ่อน
- border หนา
- text อยู่กลาง

Label ต้อง delete ได้ทั้งป้าย ไม่ใช่ลบแค่ตัวอักษร

## 12. Text Output Component

Text Output ใช้แสดงค่าที่ subscribe มาจาก tag

จุดประสงค์:

- แสดง sensor value
- แสดง machine status
- แสดงค่าจาก MQTT topic

Config:

- Tag binding
- Unit แสดงตาม tag
- Text color
- Background color
- Prefix
- Suffix
- Decimal places
- Width
- Height
- Position

Behavior:

- เมื่อ MQTT message เข้ามาที่ topic ที่ bind ไว้ ต้อง update value ทันที
- ถ้ายังไม่มี value ให้แสดง `--`
- ถ้า tag มี unit เช่น `°C` ให้แสดง `28.4 °C`

## 13. Text Input Component

Text Input ใช้กรอกค่าแล้ว publish ไปยัง tag

จุดประสงค์:

- ส่ง setpoint
- ส่ง command
- ส่ง parameter ไปยัง device

Config:

- Tag binding
- Unit แสดงตาม tag
- Placeholder
- Button text เช่น `Send`
- Input type เช่น text/number
- Width
- Height
- Position

Behavior:

- user กรอกค่า
- กด Send
- publish ไป topic ของ tag
- ถ้า tag mode ไม่ใช่ publish/pubsub ควรเตือนหรือไม่ให้เลือก

## 14. Switch Component

Switch ใช้ on/off control และแสดงสถานะ on/off

### 14.1 Switch Template

ควรรองรับหลาย template:

- Default Switch
- Custom Switch 1
- Custom Switch 2
- เพิ่ม template ใหม่ได้ในอนาคต

แต่ละ switch template อาจมี config ไม่เหมือนกัน

ตัวอย่าง:

- Switch 1 config ได้ทั้ง on color และ off color
- Switch 2 config ได้เฉพาะ on color

### 14.2 Switch Config

Config พื้นฐาน:

- Tag binding
- On value
- Off value
- On color
- Off color ถ้า template รองรับ
- Width
- Height
- Position

### 14.3 Switch Behavior

เมื่อ user click switch:

- Toggle state
- Publish value ไปยัง tag/topic
- ถ้า on ให้ publish on value
- ถ้า off ให้ publish off value

เมื่อ MQTT message เข้ามา:

- ถ้า value ตรง on value ให้ switch แสดง on
- ถ้า value ตรง off value ให้ switch แสดง off

Switch ต้อง:

- click ได้
- drag วางได้
- resize ได้
- copy/paste ได้
- delete ได้
- bind tag ได้

## 15. Tag Configuration Requirement

Tag คือ logical variable ที่ใช้เชื่อม component/model/action/alarm/dashboard เข้ากับ data source

### 15.1 Tag Field

แต่ละ tag ต้องมี:

- Tag Name
- Mode
- Topic Path
- Unit
- Data Source Type
- Payload Type

Mode:

- publish
- subscribe
- pubsub

Data Source Type:

- Direct MQTT Topic

Payload Type:

- Plaintext / Raw Value

หมายเหตุ:

- Direct MQTT Topic ใช้กับ topic ที่ส่งค่าตรง ๆ เช่น string, number, boolean หรือ plaintext
- ค่า default ของ tag ทั่วไปควรเป็น `Direct MQTT Topic` + `Plaintext / Raw Value`

ตัวอย่าง:

```json
{
  "name": "Temperature",
  "mode": "subscribe",
  "dataSourceType": "direct_mqtt_topic",
  "payloadType": "plaintext",
  "topic": "factory/line1/temp",
  "unit": "°C"
}
```

### 15.2 Unit

Unit ใช้เพื่อให้ component แสดงหน่วยอัตโนมัติ

ตัวอย่าง unit:

- `°C`
- `%`
- `rpm`
- `V`
- `A`
- `kW`
- `m/s`

เมื่อแก้ unit ใน tag:

- Text Output ที่ bind tag นี้ต้อง update unit
- Text Input ที่ bind tag นี้ต้อง update unit
- Gauge ที่ bind tag นี้ต้อง update unit
- Alarm condition ที่ใช้ tag นี้ควรแสดง unit

### 15.3 Tag UI Layout

ใน tag configuration:

- Topic Path ควรอยู่บรรทัดเดียวกับ Unit
- Unit input ต้องเล็กกว่า topic path
- Placeholder ของ unit ไม่ควรยาว
- ตัวอย่าง placeholder: `%, °C`

### 15.4 Direct MQTT Topic / Plaintext Payload

Tag config แบบทั่วไปต้องยังรองรับ topic ที่ส่งค่ามาตรง ๆ โดยไม่ต้องเป็น JSON

ตัวอย่างจาก UI:

```json
{
  "name": "sensor1",
  "mode": "publish",
  "dataSourceType": "direct_mqtt_topic",
  "payloadType": "plaintext",
  "topic": "smartfarms/oat_testja/3d/switch",
  "unit": "%"
}
```

Requirement:

- ระบบต้องรองรับ MQTT topic ปกติที่ผู้ใช้กรอกเองใน `Topic Path`
- ถ้า payload เป็น plaintext/raw value ให้เอาค่าที่ได้รับจาก MQTT มาเป็น tag value โดยตรง
- ไม่ต้อง parse JSON
- ไม่ต้องจับ pattern แบบ gateway เฉพาะทาง
- ไม่ต้องมี JSON key mapping
- Text Output / Gauge / Alarm / Model Action ต้องใช้ tag value นี้ได้เหมือน tag อื่น
- ถ้า mode เป็น `subscribe` หรือ `pubsub` ระบบต้อง subscribe topic นี้ได้
- ถ้า mode เป็น `publish` หรือ `pubsub` ระบบต้อง publish value ไป topic นี้ได้
- ค่า payload ที่ publish อาจเป็น string, number, boolean หรือ raw text ตาม component ที่ส่ง
- Direct MQTT Topic เป็น data source หลักของ version นี้

## 16. MQTT Connection Requirement

ระบบ frontend ใน browser สามารถเชื่อม MQTT ได้ผ่าน MQTT over WebSocket เท่านั้น

### 16.1 Connection Type

รองรับการเชื่อมต่อจริงจาก frontend/browser:

- `ws://`
- `wss://`

ไม่รองรับ TCP MQTT โดยตรงใน browser:

- `mqtt://host:1883` ใช้ตรงจาก frontend ไม่ได้
- ถ้าต้องใช้ TCP MQTT ต้องมี backend เช่น Node.js/NestJS เป็น gateway ใน future phase

### 16.2 MQTT Broker Connecting UI

เมื่อเลือก project type เป็น `MQTTClient` ต้องแสดงฟอร์ม MQTT broker connecting คล้ายรูปอ้างอิง

Field หลักที่ต้องมี:

- Name
- Type
- Polling
- Enable
- Address
- Security mode section
- TLS Certificate section
- Cancel button
- OK button

Layout ที่ต้องการ:

- `Name` อยู่ด้านบนเป็น input เต็มแถว
- แถวถัดมาแบ่งเป็น `Type`, `Polling`, `Enable`
- `Type` เป็น dropdown ค่าเริ่มต้น `MQTTclient`
- `Polling` เป็น dropdown ค่าเริ่มต้นเช่น `5 sec`
- `Enable` เป็น toggle switch เปิด/ปิด connection config
- `Address` เป็น input เต็มแถว พร้อม label `Address (mqtt://[server]:[port])`
- ใน version นี้ connection ที่ test จาก browser ต้องใช้ address แบบ `ws://` หรือ `wss://`
- address แบบ `mqtt://host:1883` สามารถแสดง/บันทึกเป็น future backend gateway config ได้ แต่ยังไม่ใช้เชื่อมต่อจริงจาก frontend

Security section:

- มี accordion ชื่อ `Without Security and encryption mode`
- ค่าเริ่มต้นเปิดอยู่
- ภายในมี input:
  - Client ID
  - Username
  - Password
- Password ต้องเป็น password input และมี icon สำหรับ show/hide password
- Client ID ควรมีปุ่มหรือ action สำหรับ generate อัตโนมัติ

TLS Certificate section:

- มี accordion ชื่อ `TLS Certificate`
- ค่าเริ่มต้นปิดอยู่
- เตรียม field สำหรับ certificate ในอนาคต แต่ version นี้ยังไม่บังคับ upload certificate
- ถ้าใช้ `wss://` ให้รองรับการเปิด TLS section เพื่อกรอกข้อมูลเพิ่มเติมในอนาคต

Action button:

- `CANCEL` ปิด modal โดยไม่บันทึก
- `OK` บันทึก config
- ควรมีปุ่ม `Test Connection` หรือ action ทดสอบ connection ใน modal หรือบริเวณเดียวกัน

### 16.3 MQTT Project Settings

เมื่อเลือก project type เป็น `MQTTClient` ต้องแสดง field เพิ่ม

Field ที่ต้องมี:

- Name
- Type
- Polling interval
- Enable
- Address
- Client ID
- Username
- Password
- Security mode
- TLS Certificate
- Test Connection button

ตัวอย่าง:

```text
Name: mqtt
Type: MQTTclient
Polling: 5 sec
Enable: on
Address: ws://broker.example.com:8083/mqtt
Client ID: scada_client_001
Username: user
Password: ********
Security mode: Without Security and encryption mode
TLS Certificate: collapsed
```

### 16.4 Polling Options

Polling dropdown:

- 50 ms
- 100 ms
- 200 ms
- 300 ms
- 500 ms
- 1 sec
- 1.5 sec
- 2 sec
- 3 sec
- 5 sec
- 30 sec
- 1 min

### 16.5 Test Connection

ปุ่ม Test Connection ต้อง:

- สร้าง connection จาก config
- แสดงสถานะ Connecting
- แสดง Connected ถ้าสำเร็จ
- แสดง Not Connected / Error ถ้าล้มเหลว
- แสดง error message ที่เข้าใจได้

ควรระวัง:

- Client ID ซ้ำกับโปรแกรมอื่น เช่น MQTTX จะทำให้ broker disconnect session เดิม และอาจขึ้น `Session taken over`
- ควรมีปุ่ม generate Client ID
## 17. Backend Gateway Requirement ในอนาคต

Backend Gateway เป็น future/production phase ไม่ใช่ scope ที่ต้อง implement ใน Version 07

เพื่อรองรับ product จริงในอนาคต ควรมี backend gateway

แนะนำ:

- NestJS
- TypeScript
- WebSocket Gateway
- REST API
- MQTT client
- Prisma ORM
- PostgreSQL
- TimescaleDB

หมายเหตุ:

- Version 07 ยังไม่ต้องทำ backend gateway
- Version 07 ใช้ MQTT over WebSocket จาก frontend/browser โดยตรงก่อน
- Version นี้ยังไม่รองรับ Modbus TCP/RTU
- Modbus client และ PLC protocol integration เป็น future feature

### 17.1 Backend ใช้ทำอะไร

Backend ควรรับผิดชอบ:

- เชื่อม MQTT TCP
- จัดการ MQTT subscribe/publish
- เชื่อม PLC protocol และ Modbus TCP/RTU ในอนาคต
- เก็บ tag value ล่าสุด
- เก็บ alarm history
- เก็บ project config
- จัดการ permission structure
- รองรับ user/login/permission จริงในอนาคต
- ส่ง real-time update ไป frontend ผ่าน WebSocket

### 17.2 Frontend คุยกับ Backend ผ่านอะไร

ควรใช้:

- REST API สำหรับ CRUD เช่น project, tag, dashboard, alarm
- WebSocket สำหรับ real-time data เช่น tag value, alarm event, device status

หมายเหตุ:

- Version 07 ยังไม่ต้องมี REST API จริง
- Version 07 ยังไม่ต้องมี backend WebSocket จริง
- Frontend ใช้ local state/localStorage/IndexedDB สำหรับข้อมูล config ชั่วคราวได้
- Frontend รับ realtime จาก MQTT over WebSocket โดยตรง

ตัวอย่าง flow:

```text
PLC / Sensor / MQTT Broker
        ↓
NestJS Gateway
        ↓ WebSocket
Frontend 3D SCADA
```

## 18. Model Tag Binding Requirement

Model และ model component ต้อง bind tag ได้

ใช้สำหรับ:

- แสดง status ของเครื่องจักร
- trigger action
- เปลี่ยนสีตาม value
- แสดง alarm state

Config:

- Selected tag
- Unit readonly จาก tag ถ้าจำเป็น
- Action config
- Visual state config ในอนาคต

## 19. Model Action Requirement

Model action ต้องแยกจาก manual config

### 19.1 Manual Action

Manual Action ใช้สำหรับทดลองหรือสั่ง action เองจาก config

ตัวอย่าง:

- rotate X
- rotate Y
- rotate Z
- stop

### 19.2 Tag Action

Tag Action ใช้ให้ model ทำ action ตามค่า tag

ต้องมีปุ่ม `Action Config`

เมื่อกดปุ่ม:

- เปิด popup/modal
- สามารถ Add Action ได้หลายรายการ
- UI คล้าย Tag Configuration

แต่ละ action rule มี:

- Tag
- Input value / condition value
- Action dropdown

Action dropdown:

- Rotate X
- Rotate Y
- Rotate Z
- Stop

ตัวอย่าง:

```json
{
  "tag": "motor_status",
  "conditionValue": "1",
  "action": "rotateZ"
}
```

Behavior:

- ถ้า MQTT value ของ tag เท่ากับ conditionValue ให้ทำ action
- ถ้า action เป็น stop ให้หยุด action ทั้งหมดของ model component นั้น
- action ควรถูกจำกัดตาม Model Action Preset ของ model นั้นในอนาคต

## 20. Alarm System Requirement

ระบบต้องมี alarm สำหรับแจ้งเตือนเมื่อ value เข้าเงื่อนไข

### 20.1 Alarm Condition

Alarm ควรผูกกับ tag

Condition ขั้นต้น:

- `<`
- `<=`
- `=`
- `!=`
- `>=`
- `>`

ตัวอย่าง:

```text
Temperature > 90 °C
Pressure < 2 bar
```

User เคยต้องการ condition แบบสั้น เช่น `<90` พร้อม unit

### 20.2 Alarm Config

แต่ละ alarm ควรมี:

- Alarm Name
- Tag
- Condition
- Unit
- Message
- Severity
- Enable/Disable
- Scene/Project

Severity ไม่ควรแสดงเป็นข้อความยาวใน log อย่างเดียว ควรใช้สีและ icon

ตัวอย่าง severity:

- Warning: สีเหลือง, warning icon
- Critical: สีแดง, critical icon

### 20.3 Alarm Scene Component

ควรมี component สำหรับ alarm scene เพิ่มขึ้นมา

จุดประสงค์:

- เป็น component ที่ appear ขึ้นมาเมื่อ condition เป็นจริง
- ผูก tag ได้เหมือน component ทั่วไป
- ตั้งข้อความที่จะแสดงได้
- เลือก template ได้หลายแบบเหมือน switch
- user สามารถ config style เองได้

แนวคิดสำคัญ:

- เมื่อเลือก alarm component template อาจเปิดหน้า editor อีก tab หนึ่ง
- หน้านั้นเป็น Canva-like editor
- user ตกแต่ง alarm popup ได้เต็มที่
- ตั้ง background, text, icon, layout ได้
- เก็บเป็น alarm template

Feature นี้เป็น feature สำคัญที่ควรทำในอนาคต

## 21. Alarm Log Requirement

Alarm Log ใช้แสดงประวัติ alarm

### 21.1 Columns

ควรมี columns:

- Severity
- Timestamp
- Alarm Name
- Status
- Source / Device
- Value
- Condition
- Scene / Project

ไม่ต้องมี Field สำหรับการจัดการในช่วงแรก

ควรใช้ TanStack Table สำหรับ:

- sorting
- filtering
- pagination
- column visibility
- รองรับ alarm log / event log / audit log ในอนาคต

### 21.2 Severity Display

Severity ควรแสดงแบบ icon + color

ตัวอย่าง:

- Warning: warning sign สีเหลือง
- Critical: warning sign หรือ alert icon สีแดง

อาจใช้ background สีอ่อนตาม severity เพื่อ scan ง่าย

### 21.3 Example Log

ตัวอย่าง:

| Severity | Timestamp | Alarm Name | Status | Source / Device | Value | Condition | Scene / Project |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Yellow Icon | 2026-06-15 10:15:22 | High Temperature | Active | Boiler 01 | 92 °C | > 90 °C | Main Scene / Factory A |
| Red Icon | 2026-06-15 10:17:04 | Motor Overload | Active | Motor 03 | 125 A | > 100 A | Main Scene / Factory A |
| Yellow Icon | 2026-06-15 10:20:10 | Low Pressure | Cleared | Tank 02 | 1.8 bar | < 2 bar | Utility Scene / Factory A |

## 22. Dashboard Requirement

Dashboard ใช้แสดงค่าข้อมูลในรูปแบบ panel

### 22.1 Dashboard Layout

ต้องมี:

- Add Panel button ด้านขวาบน
- Panel grid โดยใช้ React Grid Layout
- Panel setting button
- Responsive layout
- Drag/resize panel ได้
- บันทึกตำแหน่งและขนาด panel เป็น JSONB

เมื่อกด Add Panel:

- เปิด dropdown select type
- เลือกได้:
  - Chart
  - Gauge

### 22.2 Chart Panel

Chart Panel ใช้แสดงข้อมูลตามเวลา

Config:

- Panel name
- Tag
- Unit
- Chart type
- Time range
- Color

Chart type ในอนาคต:

- Line chart
- Bar chart
- Area chart

### 22.3 Gauge Panel

Gauge Panel ใช้แสดงค่าปัจจุบันแบบหน้าปัด

Requirement:

- มี Name ด้านบน
- มี Setting button
- มี semicircle gauge
- มีเลข value กลาง gauge
- มี unit ข้าง value
- มี needle
- มี Status ใต้ needle
- มี tick number บนหน้าปัด เช่น 0, 25, 50, 75, 100
- สีของ gauge ต้องมาจาก range ที่ user config

### 22.4 Gauge Setting

เมื่อกด Setting:

- เปิด modal
- เลือก tag ได้
- unit ต้องผูกกับ tag
- แก้ panel name ได้
- เพิ่ม range ได้

Gauge Range field:

- Min value
- Max value
- Color
- Status message

ตัวอย่าง:

```json
[
  { "min": 0, "max": 25, "color": "#72e8ff", "status": "Cool" },
  { "min": 26, "max": 50, "color": "#ffd84a", "status": "Hot" },
  { "min": 51, "max": 100, "color": "#ff3b30", "status": "Danger" }
]
```

Behavior:

- ถ้า value อยู่ใน range ใด ให้แสดง status ของ range นั้น
- สี gauge segment ต้องตรงกับ color ของ range
- needle angle ต้องคำนวณจาก min/max ทั้งหมด
- value ต้อง update จาก MQTT tag

## 23. Device Status Requirement

ระบบควรแสดง online/offline status ของ device และ connection

### 23.1 MQTT Broker Status

ดูจาก connection state:

- Connected
- Connecting
- Disconnected
- Error

ถ้า broker disconnect ต้องแสดงสาเหตุถ้ามี

### 23.2 Sensor / Device Status

ถ้าใช้ MQTT:

- ดูจาก last message timestamp
- ถ้าไม่มี message เกินเวลาที่กำหนด เช่น 30 วินาที ให้ถือว่า offline
- หรือใช้ heartbeat topic

ตัวอย่าง:

```text
factory/line1/device01/heartbeat
```

ถ้าใช้ backend:

- backend เป็นคนคำนวณ online/offline
- frontend รับ status ผ่าน WebSocket

### 23.3 PLC Status

Version นี้ยังไม่รองรับ Modbus TCP/RTU

Requirement ปัจจุบัน:

- ยังไม่ต้องรับ PLC status ด้วยรูปแบบ MQTT topic/payload เดิมใน version นี้
- PLC status เป็น future requirement หลังจากกำหนดรูปแบบการรับข้อมูล PLC ใหม่
- ถ้าต้องแสดง device status ใน version นี้ ให้ใช้ MQTT Direct Topic หรือ mock/local state สำหรับ frontend prototype
- ยังไม่ต้องเชื่อมต่อ Modbus TCP/RTU โดยตรง
- ยังไม่ต้อง ping/read register ด้วย backend โดยตรง

Future requirement:

- ถ้าเพิ่ม Modbus ในอนาคต backend ต้อง ping/read register เป็นระยะ
- ถ้า timeout หลายครั้งติดกันให้ offline
- ถ้า read สำเร็จให้ online

## 24. Notification Requirement

ระบบควรมี notification เมื่อเกิด alarm

ตัวเลือกที่ไม่เสียค่าใช้จ่ายหรือเสียต่ำ:

- Telegram Bot
- LINE Notify replacement / LINE Messaging API free tier ถ้ามี quota เพียงพอ
- Email SMTP
- Web Push Notification
- Discord Webhook สำหรับ testing/internal

แนะนำสำหรับ prototype:

- Telegram Bot เพราะทำง่ายและฟรี
- Web Push สำหรับแจ้งบน browser

Notification ต้องระบุ:

- Alarm Name
- Severity
- Device
- Value
- Condition
- Timestamp
- Project / Scene

## 25. Project Settings Modal Requirement

เมื่อกด icon setting หน้า project:

- เปิด popup/modal
- มี input project name
- มี dropdown select type

Project type:

- Normal
- MQTTClient

ถ้าเลือก MQTTClient:

- แสดง MQTT connection config
- แสดง Tag Configuration

Modal ต้อง:

- ไม่ล้นจอ
- มี max height
- มี scrollbar ภายใน modal
- password input ต้องมองเห็นและกรอกได้
- button save/cancel อยู่ตำแหน่งที่เข้าถึงง่าย

## 26. Right Config Sidebar Requirement

Right Config Sidebar ใช้แก้ property ของ object ที่ถูกเลือก

Behavior:

- ซ่อนเมื่อยังไม่ได้เลือก component/model
- แสดงเมื่อ click component/model
- เป็น panel ลอยด้านขวาบนของ scene
- ขนาดไม่ใหญ่เกินไป
- ถ้า content ยาวให้ scroll ภายใน

Config sidebar ควรแยก section:

- Basic
- Transform
- Style
- Tag
- Action
- Advanced

ไม่ควรวาง Background Color อยู่ข้าง ๆ config sidebar เพราะ background เป็น scene-level setting ไม่ใช่ selected component setting

## 27. UI Theme Requirement

Theme ปัจจุบันแนว dark sidebar + light scene

### 27.1 Left Sidebar

Requirement:

- Font คมชัด
- ใช้ sans-serif
- font weight ไม่หนาเกินไป
- block scene/alarm/dashboard สูงพอดี ไม่อ้วนเกินไป
- scrollbar เล็กและเข้ากับ theme
- icon สวยและอ่านง่าย

### 27.2 Icons

ต้องมี icon สำหรับ:

- Project
- Scene
- Alarm
- Dashboard
- Toolbox
- General
- Model
- Settings
- Import
- Switch
- Text
- Input
- Output
- Gauge
- Chart

ควรใช้ icon set เช่น lucide หรือ icon library ที่คุม style ได้

### 27.3 Scrollbar

Scrollbar:

- ขนาดเล็ก
- สีเข้ากับ dark theme
- hover แล้วชัดขึ้น
- ไม่กินพื้นที่มาก

## 28. Data Persistence Requirement

ระบบต้องบันทึกข้อมูล project ได้

สำหรับ Version 07:

- ยังไม่ต้องใช้ database จริง
- ยังไม่ต้องใช้ PostgreSQL
- ยังไม่ต้องใช้ TimescaleDB
- ยังไม่ต้องใช้ Prisma ORM
- ให้บันทึกข้อมูลใน browser local state, localStorage หรือ IndexedDB ได้ก่อน
- จุดประสงค์คือให้ลอง UI, scene layout, tag config และ dashboard ได้ก่อน
- ข้อมูลที่ save ใน browser เป็น prototype persistence ไม่ใช่ production persistence

ข้อมูลที่ต้อง save:

- Project settings
- MQTT config
- MQTT broker connecting config
- Future protocol config placeholder
- Tags
- Scenes
- Camera
- Background color
- Models in scene
- Model position/rotation/scale
- Model component material config
- Model action config
- 2D components
- Component style/position/size
- Component tag binding
- Dashboard panels
- Gauge ranges
- Alarm config
- User permission

สำหรับ production/future phase ควรใช้ PostgreSQL + TimescaleDB เป็น database หลัก

แนวทางการเก็บข้อมูล:

- ใช้ PostgreSQL สำหรับ project, scene, dashboard, alarm, permission และ config
- ใช้ TimescaleDB สำหรับ sensor reading, realtime history, alarm/event log ที่เป็น time-series
- ใช้ JSONB สำหรับ scene layout, component config, dashboard panel config, model material config, project config และ protocol config ในอนาคต
- ใช้ Prisma ORM สำหรับ schema, migration และ database access

ควรออกแบบ schema ให้ versioned เช่น:

```json
{
  "schemaVersion": 1,
  "project": {}
}
```

เพื่อให้ migration ในอนาคตง่าย

## 29. Recommended Architecture สำหรับ Product จริง

Version 07 ให้ implement frontend ก่อน

Product จริงในอนาคตควรแยกเป็น frontend และ backend

### 29.1 Frontend

Current implementation scope:

- React
- Vite
- TypeScript
- Three.js
- React Three Fiber
- Zustand สำหรับ state management
- TanStack Query สำหรับ API/server state
- React Hook Form สำหรับ form config
- TanStack Table สำหรับ alarm log
- React Grid Layout สำหรับ dashboard add panel
- Recharts หรือ ECharts สำหรับ dashboard chart

เหตุผล:

- component เยอะขึ้นมากในอนาคต
- state ซับซ้อน
- API/server state ต้องแยกจาก editor state
- form config เยอะ
- dashboard ต้องจัด panel ได้แบบ grid และ resize ได้
- TypeScript ช่วยลด bug จาก data shape ผิด
- React ช่วยแยก component เป็นส่วน ๆ ไม่ให้ทุกอย่างรวมใน `main.js`

### 29.2 Backend

Future/production scope ยังไม่ต้อง implement ใน Version 07

แนะนำในอนาคต:

- NestJS
- TypeScript
- WebSocket Gateway
- REST API
- MQTT.js
- Prisma ORM
- PostgreSQL
- TimescaleDB

หมายเหตุ:

- Version 07 ยังไม่ต้องสร้าง backend project
- Version 07 ยังไม่ต้องติดตั้ง Prisma/PostgreSQL/TimescaleDB
- Version นี้ยังไม่รองรับ Modbus TCP/RTU
- Modbus library เป็น future dependency เมื่อเริ่มทำ Modbus Gateway
- Scene layout, component config, dashboard config และ project config ควรเก็บเป็น JSONB

### 29.3 Suggested Folder Structure

Frontend:

```text
src/
  app/
  scenes/
  components/
    toolbox/
    sidebar/
    config-panel/
    dashboard/
    alarm/
    scene-components/
  three/
    SceneManager.ts
    ModelLoader.ts
    SelectionManager.ts
    CameraManager.ts
    TransformManager.ts
  stores/
    projectStore.ts
    sceneStore.ts
    tagStore.ts
    mqttStore.ts
    editorStore.ts
  services/
    mqttClient.ts
    projectApi.ts
    websocketClient.ts
  types/
    project.ts
    scene.ts
    tag.ts
    component.ts
    dashboard.ts
    alarm.ts
```

Backend:

```text
apps/api/src/   # future, not required in Version 07
  projects/
  auth/        # future
  users/       # future
  mqtt/
  plc/
  tags/
  alarms/
  websocket/
  dashboard/
  timeseries/
  prisma/
  permissions/
```

## 30. API Requirement

API เป็น future/production requirement

Version 07:

- ยังไม่ต้องทำ REST API จริง
- ยังไม่ต้องทำ backend endpoint
- frontend สามารถ mock API หรือใช้ local state/localStorage/IndexedDB ได้
- MQTT realtime ใช้ MQTT over WebSocket จาก frontend โดยตรง

### 30.1 REST API

ควรมี API:

```text
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/tags
POST   /projects/:id/tags
PATCH  /projects/:id/tags/:tagId
DELETE /projects/:id/tags/:tagId

GET    /projects/:id/scenes
POST   /projects/:id/scenes
PATCH  /projects/:id/scenes/:sceneId

GET    /projects/:id/alarms
POST   /projects/:id/alarms
PATCH  /projects/:id/alarms/:alarmId

GET    /projects/:id/dashboard
POST   /projects/:id/dashboard/panels
PATCH  /projects/:id/dashboard/panels/:panelId
```

Auth API เป็น future requirement:

```text
POST   /auth/login
POST   /auth/register
```

### 30.2 WebSocket Events

ตัวอย่าง event:

```text
tag:value
tag:status
alarm:active
alarm:cleared
device:online
device:offline
connection:status
control:publish
```

## 31. Validation Requirement

ระบบต้อง validate input สำคัญ

Project:

- project name ห้ามว่าง

MQTT:

- host ห้ามว่าง
- port ต้องเป็นตัวเลข
- protocol ต้องเป็น ws/wss
- path ควรขึ้นต้นด้วย `/`
- client id ต้องไม่ว่าง

Tag:

- tag name ห้ามว่าง
- topic path ห้ามว่าง
- tag name ไม่ควรซ้ำ
- topic path ไม่ควรซ้ำโดยไม่ตั้งใจ

Gauge:

- min/max ต้องเป็นตัวเลข
- max ต้องมากกว่า min
- range ไม่ควร overlap ถ้าไม่อนุญาต

Action:

- ต้องเลือก tag
- ต้องเลือก action
- condition value ห้ามว่าง

Alarm:

- ต้องเลือก tag
- condition ต้องถูกต้อง
- message/name ห้ามว่าง

## 32. Error Handling Requirement

ระบบต้องแจ้ง error แบบเข้าใจง่าย

ตัวอย่าง:

- MQTT connection failed
- Broker disconnected
- Client ID already in use / session taken over
- Cannot publish because MQTT is not connected
- Topic is missing
- Tag is not configured
- Model file cannot be loaded
- GLB format invalid

## 33. Performance Requirement

ระบบควรรองรับ:

- หลาย model ใน scene
- หลาย component 2D
- MQTT message real-time
- Dashboard update
- Alarm evaluation

ควรทำ:

- throttle UI update ถ้า message ถี่มาก
- dispose Three.js geometry/material เมื่อ delete model
- ใช้ requestAnimationFrame สำหรับ scene render
- หลีกเลี่ยงการ re-render DOM ทั้งหมดเมื่อ update value

## 34. Security Requirement

Version นี้ต้องเตรียมโครงสร้างด้าน security ให้ต่อยอดได้ แต่ยังไม่บังคับ login/signup ใน MVP

Product จริงในอนาคตต้องมี:

- Login
- Password hash
- Permission check
- Project-level authorization
- ไม่เก็บ password MQTT แบบ plain text ใน frontend storage ถ้าเป็น production
- backend ควร encrypt secret
- frontend ห้าม expose credential ที่ไม่จำเป็น

## 35. Acceptance Criteria

Acceptance criteria สำหรับ Version 07 ให้เน้น frontend prototype ก่อน

### 35.1 Scene

- User สามารถสร้าง project และเปิด scene ได้
- User สามารถ import model และวางใน scene ได้
- User สามารถวาง switch/output/input/label ได้
- User สามารถย้าย/resize/delete/copy/paste component ได้
- Camera zoom/pan/orbit ทำงานถูกต้อง

### 35.2 MQTT / Tag

- User สามารถตั้ง MQTT WebSocket connection ได้
- Test Connection แสดง connected ได้จริง
- การเชื่อม MQTT ต้องทำจาก frontend/browser โดยตรงผ่าน `ws://` หรือ `wss://`
- Version 07 ยังไม่ต้องใช้ backend gateway
- User สามารถเพิ่ม tag ได้
- Text Output แสดงค่าจาก subscribed topic ได้
- Text Input publish ค่าไป topic ได้
- Switch publish/subscribe on/off ได้
- Tag แบบ Direct MQTT Topic สามารถ subscribe topic ที่ส่ง plaintext/raw value ได้
- Direct MQTT Topic ต้องเอา payload มาเป็น tag value โดยตรงโดยไม่ parse JSON
- Tag แบบ Direct MQTT Topic สามารถ publish raw value ไปยัง topic ที่กำหนดได้

### 35.3 Model Action

- User สามารถผูก tag กับ model component ได้
- User สามารถเพิ่ม action rule ได้
- เมื่อ tag value ตรง condition model ต้อง rotate/stop ตามที่ config

### 35.4 Alarm

- User สามารถสร้าง alarm condition ได้
- เมื่อ value เข้า condition ต้องเกิด alarm
- Alarm Log แสดง timestamp, name, status, source, value, condition, scene/project
- Severity แสดงด้วย icon/color

### 35.5 Dashboard

- User สามารถเปิด Dashboard ได้
- User สามารถ Add Panel ได้
- Gauge สามารถผูก tag ได้
- Gauge แสดง value/unit/status/range color ถูกต้อง
- Chart สามารถแสดง trend ได้ในอนาคต

### 35.6 Frontend-only Scope

- สามารถเปิดและใช้งาน UI หลักได้โดยไม่ต้องรัน backend
- สามารถสร้าง/แก้ไข project config ใน frontend ได้
- สามารถสร้าง/แก้ไข scene layout ใน frontend ได้
- สามารถสร้าง/แก้ไข tag config ใน frontend ได้
- สามารถเปิด dashboard และ add panel ได้ใน frontend
- สามารถบันทึกข้อมูล prototype ลง localStorage หรือ IndexedDB ได้
- ไม่ต้องมี REST API จริง
- ไม่ต้องมี database จริง
- ไม่ต้องมี login/signup

## 36. Future Features ที่ควรทำต่อ

1. Alarm Popup Designer แบบ Canva-like
2. Modbus TCP/RTU Gateway ผ่าน backend
3. Direct PLC integration through backend gateway
4. User login และ permission จริง
5. Project save/load จาก database
6. Model action preset จาก metadata
7. Model thumbnail generator
8. Component template marketplace
9. Real-time collaboration
10. Alarm notification ไป Telegram/Web Push/Email
11. Dashboard chart แบบ historical data
12. Data historian สำหรับเก็บค่าตามเวลา
13. Export/import project file
14. Version history ของ project
15. Mobile responsive viewer mode

## 37. Prompt สำหรับให้ AI พัฒนาต่อ

ใช้ข้อความนี้เป็น prompt ตั้งต้นได้:

```text
Build a frontend-only prototype of a web-based 3D SCADA/HMI editor. Version 07 must be implemented with React + Vite + TypeScript only. Do not implement backend, REST API, database, Prisma, PostgreSQL, TimescaleDB, authentication, or server-side permission yet. The application must allow users to create projects, edit 3D scenes, import GLB models, place 2D SCADA components in a 3D world, bind components to MQTT tags, configure alarms, configure dashboards, and control/monitor devices from the frontend.

The editor should feel similar to Canva/Figma for layout interactions: drag/drop, select, resize handles, smart alignment guides, copy/paste, right-click context menu, and property panels. The 3D scene should use Three.js with orbit/pan/zoom camera, grid platform, model selection, model sub-component selection, material color configuration, and model action rules.

Version 07 must connect to MQTT broker directly from the browser using MQTT over WebSocket (`ws://` or `wss://`). If a broker only supports MQTT TCP (`mqtt://host:1883`), it is out of scope for this version and requires a future backend gateway. Modbus TCP/RTU is not supported in Version 07 and should be treated as a future feature.

The tag system must support normal direct MQTT topics. A Direct MQTT Topic tag subscribes or publishes to the exact topic path entered by the user and treats plaintext/raw payloads as the tag value directly without parsing JSON or applying gateway-specific patterns.

Use React + Vite + TypeScript on the frontend with React Three Fiber / Three.js for the 3D scene, Zustand for editor/client state, TanStack Table for alarm/event/audit logs, React Grid Layout for dashboard panels, and ECharts or Recharts for charts. TanStack Query may be installed if useful for future API structure, but Version 07 does not require real API calls.

Use browser local state, localStorage, or IndexedDB for prototype persistence. Backend architecture with NestJS, WebSocket Gateway, MQTT service, Prisma ORM, PostgreSQL, TimescaleDB, and JSONB is future/production scope and must not block frontend implementation.

Core modules required:
- Project management
- Scene editor
- Model library
- Component library
- Tag configuration
- Direct MQTT Topic tags with plaintext/raw payload support
- MQTT broker connecting form with Name, Type, Polling, Enable, Address, Security mode, and TLS Certificate sections
- MQTT connection settings
- Alarm configuration and alarm log
- Dashboard with chart and gauge panels
- User permission: watchable, controlable, editable
- Model action config based on tag values
- Browser localStorage or IndexedDB persistence for prototype data

Important behavior:
- 2D components must be world-anchored in the 3D scene, not fixed screen overlays.
- Components must scale visually with camera zoom like 3D models.
- Text Output must subscribe and display tag values with unit.
- Text Input must publish values to selected tag topic.
- Switch must publish/subscribe on/off values.
- Gauge must display value, unit, status, needle, ticks, and range colors based on user-defined ranges.
- Alarm log must show severity as icon/color, timestamp, alarm name, status, source/device, value, condition with unit, and scene/project.
- Config sidebar should appear only when an object is selected.
- Background color control should be scene-level and stay at top-right of the scene.

Design the codebase in a modular way. Do not put all logic in one file. Separate scene management, selection management, component rendering, tag service, MQTT service, alarm engine, dashboard panels, and project persistence.
```
