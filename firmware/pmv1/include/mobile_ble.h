#pragma once
// Canal de laboratorio sin emparejamiento autenticado. No usar como alarma certificada.
#ifdef PMV1_BLE
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>
static BLECharacteristic* mobileReading=nullptr;
static volatile bool mobileConnected=false;
class MobileCallbacks: public BLEServerCallbacks {
 void onConnect(BLEServer*) override { mobileConnected=true; }
 void onDisconnect(BLEServer*) override { mobileConnected=false; BLEDevice::startAdvertising(); }
};
inline void mobileBegin(){
 BLEDevice::init("Satipo-PMV1");
 BLEServer* server=BLEDevice::createServer();server->setCallbacks(new MobileCallbacks());
 BLEService* service=server->createService("6d89e001-2b74-4ec2-9c51-f1a0388b1200");
 mobileReading=service->createCharacteristic("6d89e002-2b74-4ec2-9c51-f1a0388b1200",BLECharacteristic::PROPERTY_NOTIFY);
 mobileReading->addDescriptor(new BLE2902());service->start();
 BLEAdvertising* advertising=BLEDevice::getAdvertising();
 advertising->addServiceUUID(service->getUUID());advertising->setScanResponse(true);advertising->start();
}
inline void mobileSend(const String& json){
 if(!mobileConnected||!mobileReading)return;
 String line=json+"\n";
 for(size_t offset=0;offset<line.length()&&mobileConnected;offset+=20){
  size_t count=min((size_t)20,line.length()-offset);
  mobileReading->setValue((uint8_t*)line.c_str()+offset,count);mobileReading->notify();delay(8);
 }
}
#else
inline void mobileBegin(){}
inline void mobileSend(const String&){}
#endif
