# 03 Requirement

## Version Update
- Version นี้ update ต่อจาก `02-requirement.md`
- ไฟล์นี้เป็น requirement ฉบับรวมทั้งหมดของ version 03
- การเปลี่ยนแปลงหลักจาก version 02:
  - ระบุว่าไม่รองรับ Modbus ในช่วงนี้
  - เพิ่ม PLC UI สำหรับรองรับการตั้งค่าใน Project Config
  - ระบุว่า Authentication เป็น future requirement
  - แยก Project Config ออกจาก Scene-level features
  - ระบุว่า log ต้องเก็บในฐานข้อมูลและรองรับ export/download PDF
  - ปรับ Dashboard ให้เป็นแบบ add panel และเริ่มจาก widget `Gauge` กับ `Chart`

## Project Scope

### 3D SCADA/HMI Web Platform
- พัฒนาเว็บแอปพลิเคชันสำหรับสร้างหน้าจอ SCADA/HMI ในรูปแบบ 3 มิติ
- ผู้ใช้สามารถนำเข้าโมเดล 3D ได้
- ผู้ใช้สามารถจัดวางอุปกรณ์บน scene ได้
- ผู้ใช้สามารถสร้าง scene สำหรับแสดงภาพรวมของระบบได้
- ระบบต้องรองรับการ import 3D model

## Project และ Scene Management
- ระบบสามารถสร้าง project ได้
- ระบบสามารถจัดการ scene ภายใน project ได้
- ระบบสามารถสร้าง scene ได้
- ระบบสามารถแก้ไข scene ได้
- ระบบสามารถบันทึก layout ของหน้าจอ SCADA ได้
- ระบบสามารถโหลด layout ของหน้าจอ SCADA ได้
- User permission, alarm log/config, และ dashboard ต้องอยู่ layer เดียวกับ scene
- User permission, alarm log/config, และ dashboard ไม่อยู่ใน Project Config popup

## Project Config
- Project Config ต้องเปิดผ่าน icon รูปฟันเฟือง
- เมื่อกด icon ฟันเฟือง ต้องแสดง popup สำหรับตั้งค่า project
- Project Config ต้องครอบคลุม:
  - MQTT broker config
  - PLC config
  - Tag config
- User permission ไม่อยู่ใน Project Config
- Alarm log/config ไม่อยู่ใน Project Config
- Dashboard ไม่อยู่ใน Project Config

## PLC Config
- ระบบยังไม่รองรับ Modbus 
- ระบบต้องมี UI สำหรับ PLC ไว้ก่อน
- PLC UI อยู่ใน Project Config
- PLC UI ให้ทำเป็นหน้ารองรับเหมือนแนวทาง PLC ในโปรเจกต์ `C:\3DWEB`
- PLC UI ตอนนี้เน้นรองรับการตั้งค่าและเตรียมโครงสร้าง
- PLC UI ยังไม่ต้องเชื่อมต่อ Modbus 

## Component Library
- ระบบมีคลัง component สำหรับใช้งานบนหน้า HMI
- component ต้องครอบคลุมอย่างน้อย:
  - input value
  - output value
  - text label
  - display value
  - alarm indicator
  - image
  - chart
  - widget อื่น ๆ
- ผู้ใช้สามารถลาก component ไปวางบน scene ได้

## Component Pattern Selection
- component แต่ละประเภทสามารถมีหลายรูปแบบให้เลือกใช้งานได้
- ตัวอย่างรูปแบบที่ต้องรองรับ:
  - switch หลายดีไซน์
  - text label หลายรูปแบบ
  - display หลายสไตล์
- จุดประสงค์คือเพิ่มความยืดหยุ่นในการออกแบบหน้าจอ

## Component Configuration
- ผู้ใช้สามารถตั้งค่าพื้นฐานของ component ได้
- การตั้งค่าที่ต้องรองรับ:
  - ข้อความ
  - สี
  - ขนาด
  - ตำแหน่ง
  - สถานะ on/off
  - action เช่น rotation, stop, show, hide
  - tag binding
- component ต้องสามารถผูก tag เพื่อใช้แสดงผลหรือสั่งงานได้

## 3D Model Library และ Model Configuration
- ระบบมีคลังโมเดล 3 มิติสำหรับอุปกรณ์
- ตัวอย่างโมเดลที่ต้องรองรับ:
  - tank
  - pump
  - server
  - controller
  - เครื่องจักร
- ผู้ใช้สามารถนำโมเดลไปวางบน scene ได้
- ผู้ใช้สามารถตั้งค่าพื้นฐานของโมเดลได้
- การตั้งค่าที่ต้องรองรับ:
  - ตำแหน่ง
  - ขนาด
  - สี
  - สถานะของโมเดล
- ผู้ใช้สามารถเลือกปรับเฉพาะบางชิ้นส่วนของโมเดลได้
- ผู้ใช้สามารถเลือกปรับทุกส่วนของโมเดลได้

## Predefined Model Action
- แต่ละโมเดลต้องมี action ที่กำหนดไว้ล่วงหน้าโดยผู้พัฒนา
- ตัวอย่าง action ที่ต้องรองรับ:
  - การหมุนเฉพาะบางชิ้นส่วน
  - การเปลี่ยนสีตามสถานะ
  - animation เฉพาะจุด
- จุดประสงค์คือป้องกันไม่ให้ผู้ใช้กำหนด action ที่ไม่เหมาะสมกับโครงสร้างของโมเดล

## Tag Management
- ระบบมีการจัดการ tag กลางของ project
- Tag config อยู่ใน Project Config
- tag ใช้แทนข้อมูลจากอุปกรณ์จริง
- ตัวอย่าง tag ที่ต้องรองรับ:
  - sensor value
  - machine status
  - command status
  - alarm state
- tag สามารถนำไปผูกกับ component ได้
- tag สามารถนำไปผูกกับ model action ได้

## MQTT Publish/Subscribe
- MQTT broker config อยู่ใน Project Config
- ระบบรองรับการกำหนด MQTT topic สำหรับรับข้อมูล
- ระบบรองรับการกำหนด MQTT topic สำหรับส่งข้อมูล
- ระบบสามารถ subscribe ค่าจาก sensor/controller ได้
- ระบบสามารถ publish คำสั่งควบคุมผ่าน SCADA ได้
- ตัวอย่างคำสั่งควบคุม:
  - on/off
  - set value

## Realtime Monitoring
- ระบบสามารถแสดงข้อมูล realtime บนหน้า SCADA ได้
- ตัวอย่างข้อมูล realtime ที่ต้องรองรับ:
  - ค่าจาก sensor
  - สถานะเครื่องจักร
  - สถานะ switch
  - สถานะ online/offline ของ broker
  - สถานะ online/offline ของ component
  - สถานะ online/offline ของอุปกรณ์

## Dashboard
- Dashboard อยู่ layer เดียวกับ scene
- Dashboard ต้องเป็นแบบ add panel
- ผู้ใช้สามารถเลือก widget ที่ต้องการใส่ใน dashboard ได้
- Widget หลักที่ต้องมีในช่วงแรก:
  - Gauge
  - Chart
- Dashboard ไม่ใช่ fixed layout ที่ระบบกำหนดตายตัว
- Dashboard ควรรองรับการเพิ่ม widget เพิ่มเติมในอนาคต

## Alarm Configuration
- Alarm config อยู่ layer เดียวกับ scene
- ผู้ใช้ที่มีสิทธิ์ Editable สามารถตั้งค่า alarm rule ได้
- ตัวอย่าง alarm rule ที่ต้องรองรับ:
  - ค่าสูงเกินกำหนด
  - ค่าต่ำเกินกำหนด
  - อุปกรณ์ offline
  - สถานะผิดปกติของเครื่องจักร

## Alarm และ Event Log
- Alarm log อยู่ layer เดียวกับ scene
- ระบบสามารถแสดงรายการ alarm ได้
- ระบบสามารถแสดง event log ได้
- ระบบต้องบันทึกเหตุการณ์สำคัญลงฐานข้อมูล
- ตัวอย่างเหตุการณ์ที่ต้องบันทึก:
  - alarm เกิดขึ้นเมื่อใด
  - ใคร acknowledge alarm
  - มีการเปลี่ยนสถานะของอุปกรณ์เมื่อใด
- ระบบต้องออกแบบให้รองรับการ export/download alarm log และ event log เป็น PDF

## Notification System
- ระบบสามารถแจ้งเตือนเมื่อเกิด alarm ผ่านหน้าเว็บได้

## User Authentication
- ระบบ login/signup ยังไม่ต้องทำในช่วงนี้
- Authentication ให้ถือเป็น future requirement
- โครงสร้างระบบควรออกแบบให้สามารถเพิ่ม authentication ได้ในอนาคต
- ใน MVP ยังไม่ต้องบังคับ login ก่อนเข้าใช้งาน project

## Project User Permission
- User permission อยู่ layer เดียวกับ scene
- เจ้าของ project สามารถเพิ่ม user ที่มีอยู่ในระบบเข้ามาใน project ได้
- เจ้าของ project สามารถกำหนดสิทธิ์ให้ user ได้
- สิทธิ์ที่ต้องรองรับ:
  - Watchable
  - Controllable
  - Editable

## Permission Level

### Watchable
- ดู scene ได้เท่านั้น
- ดู dashboard ได้เท่านั้น
- ดู alarm ได้เท่านั้น

### Controllable
- ทำได้เหมือน Watchable
- สามารถกด switch ได้
- สามารถใส่ input ได้
- สามารถสั่งงาน component ที่จัดวางไว้แล้วได้

### Editable
- ทำได้เหมือน Controllable
- สามารถแก้ไข scene ได้
- สามารถแก้ไข component ได้
- สามารถแก้ไข tag binding ได้
- สามารถแก้ไข MQTT broker config ได้
- สามารถแก้ไข PLC config ได้
- สามารถแก้ไข dashboard ได้
- สามารถแก้ไข alarm config ได้

## Audit Log
- ระบบบันทึกการกระทำสำคัญของผู้ใช้ลงฐานข้อมูล
- ตัวอย่างการกระทำที่ต้องบันทึก:
  - ใครกดสั่งงานอุปกรณ์
  - ใครแก้ tag binding
  - ใครแก้ alarm rule
  - ใครเปลี่ยน config ของ project
- Audit log ใช้สำหรับตรวจสอบย้อนหลัง
- เฉพาะ owner เท่านั้นที่สามารถตรวจสอบ audit log ได้
- ระบบต้องออกแบบให้รองรับการ export/download audit log เป็น PDF

## Requirement Change Rule
- ก่อนเพิ่ม requirement ใหม่หลังจากไฟล์นี้ ต้องถามผู้ใช้ก่อน
- รูปแบบคำถามต้องมีตัวเลือก:
  - Yes
  - No
  - Comment
- `Comment` ใช้เมื่อ requirement ที่เสนอไม่ตรงกับความต้องการ และผู้ใช้ต้องการระบุว่าควรเพิ่มหรือลดส่วนใด
