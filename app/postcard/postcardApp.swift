//
//  postcardApp.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import Supabase
import Realtime
import SwiftUI

@main
struct postcardApp: App {
    @StateObject var dataManager = DataManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView().environmentObject(dataManager)
        }
    }
}

// These secrets should live in gitignored file, e.g. _Secrets.swift
let supabase = SupabaseClient(
    supabaseURL: Secrets.supabaseURL,
    supabaseKey: Secrets.supabaseAnonKey
)
