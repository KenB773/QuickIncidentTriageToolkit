#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sysinfo::{System, Disks, Networks, CpuRefreshKind, MemoryRefreshKind, ProcessRefreshKind, RefreshKind,};

#[derive(Serialize)]
struct DiskInfo {
    name: String,
    mount_point: String,
    total_space: u64,
    available_space: u64,
}

#[derive(Serialize)]
struct NetworkInfo {
    interface: String,
    received: u64,
    transmitted: u64,
}

#[derive(Serialize)]
struct ProcessInfo {
    pid: i32,
    name: String,
    cpu_usage: f32,
    memory: u64,
    status: String,
}

#[derive(Serialize)]
struct SystemReport {
    hostname: Option<String>,
    os_version: Option<String>,
    kernel_version: Option<String>,
    uptime: u64,
    total_memory: u64,
    used_memory: u64,
    total_swap: u64,
    used_swap: u64,
    cpu_usage: f32,
    cpu_cores: usize,
    disk_info: Vec<DiskInfo>,
    network_info: Vec<NetworkInfo>,
    top_processes: Vec<ProcessInfo>,
}

#[tauri::command]
fn get_system_info() -> SystemReport {
    println!("[tauri] get_system_info() called");

    let mut sys = System::new_with_specifics(
        RefreshKind::everything()
            .with_memory(MemoryRefreshKind::everything())
            .with_cpu(CpuRefreshKind::everything())
            .with_processes(ProcessRefreshKind::everything()),
    );

    println!("[tauri] Refreshing system info...");
    sys.refresh_all();

    println!("[tauri] Gathering disk info...");
    let disks = Disks::new_with_refreshed_list();
    let disk_info = disks
        .list()
        .iter()
        .map(|d| DiskInfo {
            name: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_space: d.total_space(),
            available_space: d.available_space(),
        })
        .collect();

    println!("[tauri] Gathering network info...");
    let networks = Networks::new_with_refreshed_list();
    let network_info = networks
        .iter()
        .map(|(name, data)| NetworkInfo {
            interface: name.clone(),
            received: data.total_received(),
            transmitted: data.total_transmitted(),
        })
        .collect();

    println!("[tauri] Gathering processes...");
    let mut processes: Vec<_> = sys
        .processes()
        .iter()
        .map(|(pid, proc_)| ProcessInfo {
            pid: pid.as_u32() as i32,
            name: proc_.name().to_string_lossy().to_string(),
            cpu_usage: proc_.cpu_usage(),
            memory: proc_.memory(),
            status: format!("{:?}", proc_.status()),
        })
        .collect();

    processes.sort_by(|a, b| b.cpu_usage.total_cmp(&a.cpu_usage));
    processes.truncate(10);

    println!("[tauri] Assembling report...");
    let report = SystemReport {
        hostname: System::host_name(),
        os_version: System::long_os_version(),
        kernel_version: System::kernel_version(),
        uptime: System::uptime(),
        total_memory: sys.total_memory(),
        used_memory: sys.used_memory(),
        total_swap: sys.total_swap(),
        used_swap: sys.used_swap(),
        cpu_usage: sys.global_cpu_usage(),
        cpu_cores: sys.cpus().len(),
        disk_info,
        network_info,
        top_processes: processes,
    };

    println!("[tauri] Report assembled successfully");
    report
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_system_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}