//
//  ContentView.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct ContentView: View {
    @Binding var thisFridge: Fridge?
    @EnvironmentObject var dataManager: DataManager
    @State private var fridgeNumber: String = ""
    @State private var fridgeName: String = ""
    @State private var showQR: Bool = false
    
    let context = CIContext()
    let filter = CIFilter.qrCodeGenerator()
    
    
    var login: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Let's login!")
            TextField(
                "Fridge Phone Number", text: $fridgeNumber
            )
            .keyboardType(.numberPad)
            Button("Submit") {
                dataManager.findThisFridge(fridgeNumber: fridgeNumber)
            }
        }
        .padding()
    }
    
    var chooseName: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Let's name your fridge!")
            TextField(
                "Fridge Name", text: $fridgeName
            )
            Button("Submit") {
                thisFridge!.fridgeName = fridgeName
                dataManager.updateThisFridge()
            }
        }
        .padding()
    }
    
    var QRModal: some View {
        VStack() {
            Button {
                showQR = false
            } label: {
                Text("Hide QR Code")
            }
            Image(uiImage: generateQRCode(from: "SMSTO:+\(thisFridge!.fridgeNumber):JOIN \(thisFridge!.fridgeName) on shelf life!"))
                .resizable()
                .interpolation(.none)
                .scaledToFit()
                .frame(width: 200, height: 200)
        }
        .padding()
    }
    
    var shelf: some View {
        VStack() {
            Button {
                showQR = true
            } label: {
                Text("Show QR Code")
            }
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Hello, \(thisFridge!.fridgeName)!")
            Button("Refresh", action: dataManager.fetchNewMessages)
            
            ScrollView(.horizontal) {
                HStack() {
                    ForEach(dataManager.messages, id: \.id) { message in
                        Button {
                            print("hi")
                        } label: {
                            Image("cup").resizable()
                            if (message.senderName != nil) {
                                Text(message.senderName!)
                            }
                        }
                        .frame(width: 200.0, height: 200.0)
                    }
                }
            }
            //                if dataManager.messages.count > 0 {
            //                    let message = dataManager.messages[0]
            //                    WebView(url: URL(string: message.link)!)
            //                        .border(.black)
            //                }
        }
        .padding()
        .onAppear {
            dataManager.fetchNewMessages()
        }
    }
    
    var body: some View {
        if thisFridge == nil {
            login
        } else if thisFridge!.fridgeName.isEmpty {
            chooseName
        } else if showQR {
            QRModal
        } else {
            shelf
        }
    }
    
    func generateQRCode(from string: String) -> UIImage {
        filter.message = Data(string.utf8)
//        filter.setValue(CGColor(red: 3, green: 3, blue: 3, alpha: 3), forKey: "kCIAttributeOpaqueColor")

//        filter.kCIAttributeOpaqueColor = CGColor(red: 3, green: 3, blue: 3, alpha: 3)
        
        if let outputImage = filter.outputImage {
            if let cgimg = context.createCGImage(outputImage, from: outputImage.extent) {
                return UIImage(cgImage: cgimg)
            }
        }
        
        return UIImage(systemName: "xmark.circle") ?? UIImage()
    }
}



struct ContentView_Previews: PreviewProvider {
    @StateObject static private var dataManager = DataManager()
    static var previews: some View {
        ContentView(thisFridge: $dataManager.thisFridge).environmentObject(dataManager)
    }
}
