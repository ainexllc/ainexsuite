# Ports Skill

Show which AinexSuite apps are currently running on which ports.

## Usage

```
/ports
```

## Instructions

1. Run the following command to check which ports are in use:

```bash
lsof -i :3000-3020 -P -n | grep LISTEN
```

2. Parse the output and display as a formatted table showing:
   - **App**: Map port to app name using the reference below
   - **Port**: The port number
   - **PID**: Process ID
   - **Status**: Running

3. If no processes are found, report "No AinexSuite apps currently running."

## Port to App Mapping

| Port | App      |
| ---- | -------- |
| 3000 | main     |
| 3001 | notes    |
| 3002 | journal  |
| 3003 | todo     |
| 3004 | health   |
| 3005 | album    |
| 3006 | habits   |
| 3007 | mosaic   |
| 3008 | fit      |
| 3009 | projects |
| 3010 | flow     |
| 3011 | subs     |
| 3012 | docs     |
| 3013 | tables   |
| 3014 | calendar |
| 3020 | admin    |

## Example Output

```
Currently Running Apps:

| App      | Port | PID   | Status  |
|----------|------|-------|---------|
| main     | 3000 | 12345 | Running |
| notes    | 3001 | 12346 | Running |
| journal  | 3002 | 12347 | Running |

3 apps running
```
