import { ChevronDown, ChevronUp, Eye, EyeOff, RadioTower, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { testMqttConnection } from "../../services/mqtt";
import { Button, IconButton, SelectField, StatusPill, TextField } from "../../shared/ui";
import type { MqttConnectionConfig, MqttConnectionStatus, MqttPollingOption } from "../project";

type MqttBrokerFormProps = {
  config: MqttConnectionConfig;
  onChange: (config: MqttConnectionConfig) => void;
};

const pollingOptions: MqttPollingOption[] = [
  "50 ms",
  "100 ms",
  "200 ms",
  "300 ms",
  "500 ms",
  "1 sec",
  "1.5 sec",
  "2 sec",
  "3 sec",
  "5 sec",
  "30 sec",
  "1 min",
];

type MqttWebSocketAddressParts = {
  host: string;
  path: string;
  port: string;
  protocol: "ws://" | "wss://";
};

function getStatusLabel(status: MqttConnectionStatus) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "connecting") {
    return "Connecting";
  }

  if (status === "error") {
    return "Error";
  }

  return "Not Tested";
}

function getDefaultPort(protocol: MqttWebSocketAddressParts["protocol"]) {
  return protocol === "wss://" ? "443" : "80";
}

function normalizePath(path: string) {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return "";
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

function parseMqttAddress(address: string): MqttWebSocketAddressParts {
  const fallback: MqttWebSocketAddressParts = {
    host: "",
    path: "/mqtt",
    port: "443",
    protocol: "wss://",
  };

  if (!address.trim()) {
    return fallback;
  }

  try {
    const url = new URL(address.trim());
    const protocol = url.protocol === "ws:" ? "ws://" : "wss://";

    return {
      host: url.hostname,
      path: url.pathname === "/" ? "/mqtt" : url.pathname,
      port: url.port || getDefaultPort(protocol),
      protocol,
    };
  } catch {
    return fallback;
  }
}

function buildMqttAddress(parts: MqttWebSocketAddressParts) {
  const host = parts.host.trim();
  const port = parts.port.trim();
  const path = normalizePath(parts.path);

  if (!host) {
    return "";
  }

  return `${parts.protocol}${host}${port ? `:${port}` : ""}${path}`;
}

export function MqttBrokerForm({ config, onChange }: MqttBrokerFormProps) {
  const [securityOpen, setSecurityOpen] = useState(true);
  const [tlsOpen, setTlsOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [status, setStatus] = useState<MqttConnectionStatus>("idle");
  const [message, setMessage] = useState("Use ws:// or wss:// for browser test connection.");

  const updateConfig = (patch: Partial<MqttConnectionConfig>) => {
    onChange({ ...config, ...patch });
  };

  const updateAddressPart = (patch: Partial<MqttWebSocketAddressParts>) => {
    const currentParts = parseMqttAddress(config.address);
    const nextParts = { ...currentParts, ...patch };
    updateConfig({ address: buildMqttAddress(nextParts) });
  };

  const handleTestConnection = async () => {
    setStatus("connecting");
    setMessage("Connecting to MQTT broker...");

    try {
      await testMqttConnection(config);
      setStatus("connected");
      setMessage("Connected. The browser can reach this MQTT WebSocket broker.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "MQTT connection failed.";
      setStatus("error");
      setMessage(message);
    }
  };

  const SecurityIcon = securityOpen ? ChevronUp : ChevronDown;
  const TlsIcon = tlsOpen ? ChevronUp : ChevronDown;
  const PasswordIcon = passwordVisible ? EyeOff : Eye;
  const addressParts = parseMqttAddress(config.address);
  const normalizedAddress = buildMqttAddress(addressParts);

  useEffect(() => {
    if (normalizedAddress && config.address.trim() !== normalizedAddress) {
      updateConfig({ address: normalizedAddress });
    }
  }, [config.address, normalizedAddress]);

  return (
    <section className="mqtt-form" aria-label="MQTT broker connecting form">
      <div className="mqtt-form-header">
        <div>
          <h3>MQTT Broker Connecting</h3>
          <p>Configure the browser WebSocket broker path for this project.</p>
        </div>
        <StatusPill tone={status === "error" ? "danger" : status === "connected" ? "online" : "info"}>
          {getStatusLabel(status)}
        </StatusPill>
      </div>

      <div className="mqtt-form-grid">
        <TextField
          label="Name"
          onChange={(event) => updateConfig({ name: event.target.value })}
          value={config.name}
        />
        <SelectField label="Type" value={config.type} disabled>
          <option value="MQTTclient">MQTTclient</option>
        </SelectField>
        <SelectField
          label="Polling"
          onChange={(event) => updateConfig({ polling: event.target.value as MqttPollingOption })}
          value={config.polling}
        >
          {pollingOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
        <label className="toggle-field">
          Enable
          <input
            checked={config.enabled}
            onChange={(event) => updateConfig({ enabled: event.target.checked })}
            type="checkbox"
          />
          <span aria-hidden="true" />
        </label>
      </div>

      <div className="mqtt-address-grid">
        <SelectField
          label="Protocol"
          onChange={(event) =>
            updateAddressPart({ protocol: event.target.value as MqttWebSocketAddressParts["protocol"] })
          }
          value={addressParts.protocol}
        >
          <option value="ws://">ws://</option>
          <option value="wss://">wss://</option>
        </SelectField>
        <TextField
          aria-label="MQTT host"
          label="Host"
          onChange={(event) => updateAddressPart({ host: event.target.value })}
          placeholder="smartfarm.priorsolution.co.th"
          value={addressParts.host}
        />
      </div>

      <div className="mqtt-endpoint-grid">
        <TextField
          inputMode="numeric"
          label="Port"
          onChange={(event) => updateAddressPart({ port: event.target.value })}
          placeholder="443"
          value={addressParts.port}
        />
        <TextField
          label="Path"
          onChange={(event) => updateAddressPart({ path: event.target.value })}
          placeholder="/mqtt"
          value={addressParts.path}
        />
      </div>

      <section className="settings-accordion">
        <button
          aria-expanded={securityOpen}
          className="settings-accordion-trigger"
          onClick={() => setSecurityOpen((current) => !current)}
          type="button"
        >
          <span>Without Security and encryption mode</span>
          <SecurityIcon size={16} />
        </button>

        {securityOpen ? (
          <div className="settings-accordion-body">
            <TextField
              label="Client ID"
              onChange={(event) => updateConfig({ clientId: event.target.value })}
              value={config.clientId}
            />
            <TextField
              label="Username"
              onChange={(event) => updateConfig({ username: event.target.value })}
              value={config.username}
            />
            <label>
              Password
              <div className="password-field">
                <input
                  onChange={(event) => updateConfig({ password: event.target.value })}
                  type={passwordVisible ? "text" : "password"}
                  value={config.password}
                />
                <IconButton
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  onClick={() => setPasswordVisible((current) => !current)}
                >
                  <PasswordIcon size={16} />
                </IconButton>
              </div>
            </label>
          </div>
        ) : null}
      </section>

      <section className="settings-accordion">
        <button
          aria-expanded={tlsOpen}
          className="settings-accordion-trigger"
          onClick={() => setTlsOpen((current) => !current)}
          type="button"
        >
          <span>TLS Certificate</span>
          <TlsIcon size={16} />
        </button>

        {tlsOpen ? (
          <div className="settings-accordion-body">
            <label className="toggle-field">
              Enable TLS Certificate
              <input
                checked={config.tlsEnabled}
                onChange={(event) => updateConfig({ tlsEnabled: event.target.checked })}
                type="checkbox"
              />
              <span aria-hidden="true" />
            </label>
          </div>
        ) : null}
      </section>

      <div className={`mqtt-test-message mqtt-test-message-${status}`}>
        <RadioTower size={16} />
        <span>{message}</span>
      </div>

      <div className="mqtt-form-actions">
        <Button onClick={handleTestConnection}>
          <RotateCcw size={16} />
          Test Connection
        </Button>
      </div>
    </section>
  );
}
